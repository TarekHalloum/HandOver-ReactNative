// src/screens/Login.tsx
// HandOver ▸ Auth – Login screen (patched eye‑icon + web masking)
//---------------------------------------------------------------------
import React, { useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */
type LoginNavProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */
export default function Login() {
  const navigation = useNavigation<LoginNavProp>();
  const { width } = useWindowDimensions();

  /* ----------------------------- State ---------------------------- */
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isContractor, setIsContractor] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  /* ---------------------- Web password dots ----------------------- */
  const webPwStyle =
    Platform.OS === 'web'
      ? ({
          WebkitTextSecurity: showPassword ? 'none' : 'disc',
          outlineWidth: 0,
        } as any)
      : {};

  /* -------------------------- Login API --------------------------- */
  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      setErrorModalVisible(true);
      return;
    }

    try {
      const response = await fetch('http://20.174.11.55/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (response.ok) {
        const { access_token, user_type } = data;
        const role = user_type ?? 'client';

        await AsyncStorage.multiSet([
          ['@token', access_token],
          ['@userType', role],
        ]);

        if (role === 'contractor') {
          if (isContractor) {
            navigation.replace('ContractorTabs', { screen: 'Home' });
          } else {
            setErrorMessage('Please select "Contractor" to log in.');
            setErrorModalVisible(true);
          }
        } else {
          if (isContractor) {
            setErrorMessage('Please select "User" to log in.');
            setErrorModalVisible(true);
          } else {
            navigation.replace('RootTabs', {
              screen: 'Home',
              params: { userType: role },
            });
          }
        }
      } else if (response.status === 401 || data.error === 'Unauthorized') {
        setErrorMessage('Email or password is incorrect.');
        setErrorModalVisible(true);
      } else {
        setErrorMessage(data.message || 'Something went wrong.');
        setErrorModalVisible(true);
      }
    } catch (err) {
      setErrorMessage('Unable to reach server. Please check your connection.');
      setErrorModalVisible(true);
    }
  };

  /* -------------------------- Sign up ----------------------------- */
  const handleSignUp = () => {
    if (isContractor) {
      navigation.navigate('SignUpContractor');
    } else {
      navigation.navigate('SignUp');
    }
  };

  /* ----------------------------- UI ------------------------------- */
  return (
    <KeyboardAvoidingView
      style={styles.page}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      <ScrollView
        contentContainerStyle={styles.inner}
        keyboardShouldPersistTaps="handled"
      >
        {/* Error Pop‑up */}
        <Modal
          visible={errorModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setErrorModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>{errorMessage}</Text>
              <TouchableOpacity
                onPress={() => setErrorModalVisible(false)}
                style={styles.modalButton}
              >
                <Text style={styles.modalButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Back arrow */}
        <TouchableOpacity
          style={[styles.backButton, { left: width < 380 ? 10 : 20 }]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#3E575D" />
        </TouchableOpacity>

        {/* Dynamic logo */}
        <Image
          source={
            isContractor
              ? require('../assets/contractor.png')
              : require('../assets/login.png')
          }
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Login card */}
        <View style={styles.card}>
          <Text style={styles.title}>Login</Text>

          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />

          {/* Password with eye */}
          <View style={styles.passwordBox}>
            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={Platform.OS !== 'web' && !showPassword}
              autoCapitalize="none"
              style={[styles.passwordInput, webPwStyle]}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(p => !p)}
              style={styles.eyeIcon}
            >
              {/* Show open eye when hidden, eye‑off when visible */}
              <Ionicons
                name={showPassword ? 'eye' : 'eye-off'}
                size={20}
                color="#3E575D"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={handleLogin} style={styles.button}>
            <Text style={styles.buttonText}>Log In</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleSignUp} style={styles.link}>
            <Text style={styles.linkText}>
              Don't have an account?{' '}
              <Text style={styles.linkBold}>Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Role selector */}
        <View style={styles.radioContainer}>
          <TouchableOpacity
            style={styles.radioButton}
            onPress={() => setIsContractor(false)}
          >
            <View style={styles.radioCircle}>
              {!isContractor && <View style={styles.selectedRb} />}
            </View>
            <Text style={styles.radioText}>User</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.radioButton}
            onPress={() => setIsContractor(true)}
          >
            <View style={styles.radioCircle}>
              {isContractor && <View style={styles.selectedRb} />}
            </View>
            <Text style={styles.radioText}>Contractor</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* ------------------------------------------------------------------ */
/*  Styles                                                            */
/* ------------------------------------------------------------------ */
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
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
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
    marginBottom: 12,
    fontSize: 16,
  },
  passwordBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3E575D',
    borderRadius: 4,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 4,
  },
  button: {
    backgroundColor: '#3E575D',
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
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
  radioContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  radioCircle: {
    height: 16,
    width: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#3E575D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedRb: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3E575D',
  },
  radioText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#3E575D',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#3E575D',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#3E575D',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});