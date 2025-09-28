// src/screens/SignUp.tsx
// HandOver ▸ Client sign‑up screen (with inline validation messages)
// -----------------------------------------------------------------------------
import React, { useState, useLayoutEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type {
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */
type SignUpNavProp = NativeStackNavigationProp<AuthStackParamList, 'SignUp'>;

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */
export default function SignUp() {
  const navigation = useNavigation<SignUpNavProp>();
  const { width } = useWindowDimensions();

  /* ------------------------------ Header ---------------------------------- */
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: '',
      headerTransparent: true,
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ paddingHorizontal: 12 }}
        >
          <Ionicons name="arrow-back" size={24} color="#3E575D" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  /* ------------------------------ State ----------------------------------- */
  const [fullName, setFullName]       = useState('');
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [confirmPassword, setConfirm] = useState('');
  const [showPassword, setShowPw]     = useState(false);
  const [showConfirm, setShowCpw]     = useState(false);

  // validation messages
  const [emailErr,    setEmailErr]    = useState('');
  const [pwErr,       setPwErr]       = useState('');
  const [confirmErr,  setConfirmErr]  = useState('');
  const [generalErr,  setGeneralErr]  = useState('');

  /* ---------------------------- Helpers ----------------------------------- */
  const clearErrors = useCallback(() => {
    setEmailErr('');
    setPwErr('');
    setConfirmErr('');
    setGeneralErr('');
  }, []);

  const validateInputs = (): boolean => {
    clearErrors();
    let ok = true;

    // Email
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setEmailErr('Email should contain "@" and "."');
      ok = false;
    }

    // Password match
    if (password !== confirmPassword) {
      setConfirmErr("Passwords didn't match …");
      ok = false;
    }

    // Password strength: ≥5 letters, ≥1 capital, ≥1 number
    const letters = (password.match(/[A-Za-z]/g) || []).length;
    if (letters < 5 || !/[A-Z]/.test(password) || !/\d/.test(password)) {
      setPwErr('Password should contain at least 5 letters, 1 capital letter and 1 number.');
      ok = false;
    }

    return ok;
  };

  /* ---------------------------- Submit ------------------------------------ */
  const handleSignUp = async () => {
    if (!validateInputs()) return;

    try {
      const response = await fetch('http://20.174.11.55/api/registerclient', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({
          name: fullName,
          email,
          password,
          password_confirmation: confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Laravel uniqueness error
        if (data?.errors?.email?.[0] === 'The email has already been taken.') {
          setEmailErr('Email already registered …');
        } else {
          setGeneralErr(data.message || 'An error occurred.');
        }
        return;
      }

      // ------------------ Success ------------------
      const { access_token } = data;
      const role = 'client';

      await AsyncStorage.multiSet([
        ['@token', access_token],
        ['@userType', role],
      ]);

      navigation.replace('RootTabs', {
        screen: 'Home',
        params: { userType: role },
      });
    } catch (err) {
      console.error(err);
      setGeneralErr('Network error – please try again.');
    }
  };

  /* ---------------------- Web‑specific password dots ---------------------- */
  const webPwStyle =
    Platform.OS === 'web'
      ? ({ WebkitTextSecurity: showPassword ? 'none' : 'disc', outlineWidth: 0 } as any)
      : {};
  const webCpwStyle =
    Platform.OS === 'web'
      ? ({ WebkitTextSecurity: showConfirm ? 'none' : 'disc', outlineWidth: 0 } as any)
      : {};

  /* ------------------------------ UI -------------------------------------- */
  return (
    <KeyboardAvoidingView
      style={styles.page}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      <ScrollView
        contentContainerStyle={styles.inner}
        keyboardShouldPersistTaps="handled"
      >
        <Image
          source={require('../assets/login.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <View style={styles.card}>
          <Text style={styles.title}>Sign Up</Text>

          {/* Global error */}
          {generalErr ? <Text style={styles.errGeneral}>{generalErr}</Text> : null}

          {/* Full name */}
          <TextInput
            placeholder="Full Name"
            value={fullName}
            onChangeText={setFullName}
            style={styles.input}
          />

          {/* Email */}
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={text => {
              setEmail(text);
              if (emailErr) setEmailErr('');
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
          {emailErr ? <Text style={styles.err}>{emailErr}</Text> : null}

          {/* Password */}
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={text => {
                setPassword(text);
                if (pwErr) setPwErr('');
              }}
              secureTextEntry={Platform.OS !== 'web' && !showPassword}
              autoCapitalize="none"
              style={[styles.passwordInput, webPwStyle]}
            />
            <TouchableOpacity onPress={() => setShowPw(v => !v)}>
              <Ionicons name={showPassword ? 'eye' : 'eye-off'} size={24} color="#3E575D" />
            </TouchableOpacity>
          </View>
          {pwErr ? <Text style={styles.err}>{pwErr}</Text> : null}

          {/* Confirm Password */}
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={text => {
                setConfirm(text);
                if (confirmErr) setConfirmErr('');
              }}
              secureTextEntry={Platform.OS !== 'web' && !showConfirm}
              autoCapitalize="none"
              style={[styles.passwordInput, webCpwStyle]}
            />
            <TouchableOpacity onPress={() => setShowCpw(v => !v)}>
              <Ionicons name={showConfirm ? 'eye' : 'eye-off'} size={24} color="#3E575D" />
            </TouchableOpacity>
          </View>
          {confirmErr ? <Text style={styles.err}>{confirmErr}</Text> : null}

          <TouchableOpacity onPress={handleSignUp} style={styles.button}>
            <Text style={styles.buttonText}>Create Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.replace('Login')}
            style={styles.link}
          >
            <Text style={styles.linkText}>
              Already have an account? <Text style={styles.linkBold}>Log In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* -------------------------------------------------------------------------- */
/*  Styles                                                                    */
/* -------------------------------------------------------------------------- */
const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  inner: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 20,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#3E575D',
    textAlign: 'center',
    marginBottom: 16,
  },
  input: {
    borderWidth: 2,
    borderColor: '#3E575D',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3E575D',
    borderRadius: 4,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#3E575D',
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  link: {
    marginTop: 12,
    alignItems: 'center',
  },
  linkText: {
    color: '#3E575D',
    fontSize: 14,
  },
  linkBold: {
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  err: {
    color: '#D72638',
    fontSize: 13,
    marginBottom: 8,
  },
  errGeneral: {
    color: '#D72638',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
});