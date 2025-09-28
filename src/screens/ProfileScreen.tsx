// ─────────────────────────────────────────────────────────────────────────────
//  ProfileScreen.tsx
// ─────────────────────────────────────────────────────────────────────────────
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Modal,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Logo from '../components/Logo';

/* ─── Palette ─────────────────────────────────────────── */
const COLOR = {
  canvas  : '#FAF9F6',
  primary : '#3E575D',
  accent  : '#EFE7DC',
  error   : '#D72638',
};
const BOTTOM_GAP = 24;

/* ─── Assets ──────────────────────────────────────────── */
const PROFILE_PIC = require('../assets/profile.png');

/* dynamic banner ratio */
let pW = 1, pH = 1;
if (Platform.OS !== 'web') {
  // @ts-ignore – helper isn’t typed
  const { width, height } = (Image as any).resolveAssetSource(PROFILE_PIC);
  pW = width; pH = height;
}
const profileRatio = pW / pH;

/* ─── Component ───────────────────────────────────────── */
export default function ProfileScreen() {
  const insets     = useSafeAreaInsets();
  const navigation = useNavigation();

  /* data + state */
  const [user, setUser]         = useState<any>(null);
  const [loading, setLoading]   = useState(true);
  const [pwdModal, setPwdModal] = useState(false);

  const [oldPassword,     setOldPassword]     = useState('');
  const [newPassword,     setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [oldPwdErr,  setOldPwdErr]  = useState('');
  const [newPwdErr,  setNewPwdErr]  = useState('');
  const [confirmErr, setConfirmErr] = useState('');
  const [generalErr, setGeneralErr] = useState('');

  // toggle visibility for each password field
  const [showOldPwd, setShowOldPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showCfmPwd, setShowCfmPwd] = useState(false);

  // on web, switch bullets to plain text
  const webOldStyle = Platform.OS === 'web'
    ? ({ WebkitTextSecurity: showOldPwd ? 'none' : 'disc', outlineWidth: 0 } as any)
    : {};
  const webNewStyle = Platform.OS === 'web'
    ? ({ WebkitTextSecurity: showNewPwd ? 'none' : 'disc', outlineWidth: 0 } as any)
    : {};
  const webCfmStyle = Platform.OS === 'web'
    ? ({ WebkitTextSecurity: showCfmPwd ? 'none' : 'disc', outlineWidth: 0 } as any)
    : {};

  const clearErrors = useCallback(() => {
    setOldPwdErr(''); setNewPwdErr(''); setConfirmErr(''); setGeneralErr('');
  }, []);

  /* fetch profile once */
  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('@token');
        if (!token) { setGeneralErr('Not authenticated'); return; }

        const res  = await fetch('http://20.174.11.55/api/user',
                      { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        res.ok ? setUser(data) : setGeneralErr(data.message || 'Failed to load profile');
      } catch { setGeneralErr('Network error'); }
      finally  { setLoading(false); }
    })();
  }, []);

  /* helpers */
  const validateInputs = (): boolean => {
    clearErrors();
    let ok = true;
    if (!oldPassword)                    { setOldPwdErr('Old password is required'); ok = false; }
    if (!newPassword)                    { setNewPwdErr('New password is required'); ok = false; }
    if (newPassword.length < 6)          { setNewPwdErr('New password must be ≥ 6 chars'); ok = false; }
    // Password strength: ≥5 letters, ≥1 uppercase, ≥1 number
    const letters = (newPassword.match(/[A-Za-z]/g) || []).length;
    if (letters < 5 || !/[A-Z]/.test(newPassword) || !/\d/.test(newPassword)) {
      setNewPwdErr('Password should contain at least 5 letters, 1 capital letter and 1 number.');
      ok = false;
    }

    if (newPassword !== confirmPassword) { setConfirmErr("Passwords don't match"); ok = false; }
    return ok;
  };

const submitPassword = async () => {
  if (!validateInputs()) return;

  try {
    const token = await AsyncStorage.getItem('@token');
    const res = await fetch('http://20.174.11.55/api/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        old_password: oldPassword,             // matches your controller’s validation
        password: newPassword,                 // rename new_password → password
        password_confirmation: confirmPassword // rename new_password_confirmation → password_confirmation
      }),
    });

    const json = await res.json();

    if (!res.ok) {
      // map errors to your state setters
      if (json.errors?.old_password) {
        setOldPwdErr(json.errors.old_password[0]);
      }
      if (json.errors?.password) {
        setNewPwdErr(json.errors.password[0]);
      }

      if (json.errors?.password_confirmation) {
        setConfirmErr(json.errors.password_confirmation[0]);
      }

      // any other general error message
      if (json.message && !json.errors) {
        setGeneralErr(json.message);
      }
      return;
    }

    // on success
    Alert.alert('Success', 'Password changed successfully');
    setPwdModal(false);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');

  } catch (e) {
    setGeneralErr('Network error – please try again');
  }
};


  /* fallback views */
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLOR.primary} />
      </View>
    );
  }
  if (!user) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errGeneral}>{generalErr || 'No user data'}</Text>
      </View>
    );
  }

  /* main layout */
  return (
    <View style={{ flex: 1, backgroundColor: COLOR.canvas }}>
      {/* scrollable body */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        {/* header row */}
        <View style={[styles.headerRow, { top: insets.top + 8 }]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="chevron-back" size={24} color={COLOR.primary} />
          </TouchableOpacity>
          <Ionicons name="person-outline" size={24} color={COLOR.primary} style={{ marginLeft: 6 }} />
          <Text style={styles.headerLabel}>Profile</Text>
        </View>

        {/* banner */}
        <Image source={PROFILE_PIC} style={[styles.banner, { aspectRatio: profileRatio }]} />

        {/* info card */}
        <View style={styles.infoCard}>
          <Text style={styles.row}>
            <Text style={styles.labelStrong}>Name: </Text>
            <Text style={styles.value}>{user.name}</Text>
          </Text>
          <Text style={styles.row}>
            <Text style={styles.labelStrong}>Email: </Text>
            <Text style={styles.value}>{user.email}</Text>
          </Text>
          <Text style={styles.row}>
            <Text style={styles.labelStrong}>User Type: </Text>
            <Text style={styles.value}>{user.user_type}</Text>
          </Text>
        </View>

        {/* Change-password launcher */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: COLOR.primary }]}
          onPress={() => { clearErrors(); setPwdModal(true); }}
        >
          <Text style={styles.buttonText}>Change Password</Text>
        </TouchableOpacity>

        {/* spacer so last item never hides behind footer */}
        <View style={{ height: BOTTOM_GAP }} />
      </ScrollView>

      {/* footer logo */}
      <View style={{ alignItems: 'center', paddingBottom: insets.bottom + BOTTOM_GAP }}>
        <Logo />
      </View>

      {/* Password modal */}
      <Modal
        visible={pwdModal}
        animationType="slide"
        transparent
        onRequestClose={() => setPwdModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            {!!generalErr && <Text style={styles.errGeneral}>{generalErr}</Text>}

            <Text style={styles.label}>Old Password</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.passwordInput, webOldStyle]}
                secureTextEntry={Platform.OS !== 'web' && !showOldPwd}
                value={oldPassword}
                onChangeText={t => { setOldPassword(t); oldPwdErr && setOldPwdErr(''); }}
              />
              <TouchableOpacity onPress={() => setShowOldPwd(v => !v)}>
                <Ionicons
                  name={showOldPwd ? 'eye' : 'eye-off'}
                  size={24}
                  color={COLOR.primary}
                />
              </TouchableOpacity>
            </View>
            {!!oldPwdErr && <Text style={styles.err}>{oldPwdErr}</Text>}


            <Text style={styles.label}>New Password</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.passwordInput, webNewStyle]}
                secureTextEntry={Platform.OS !== 'web' && !showNewPwd}
                value={newPassword}
                onChangeText={t => { setNewPassword(t); newPwdErr && setNewPwdErr(''); }}
              />
              <TouchableOpacity onPress={() => setShowNewPwd(v => !v)}>
                <Ionicons
                  name={showNewPwd ? 'eye' : 'eye-off'}
                  size={24}
                  color={COLOR.primary}
                />
              </TouchableOpacity>
            </View>
            {!!newPwdErr && <Text style={styles.err}>{newPwdErr}</Text>}


            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.passwordInput, webCfmStyle]}
                secureTextEntry={Platform.OS !== 'web' && !showCfmPwd}
                value={confirmPassword}
                onChangeText={t => { setConfirmPassword(t); confirmErr && setConfirmErr(''); }}
              />
              <TouchableOpacity onPress={() => setShowCfmPwd(v => !v)}>
                <Ionicons
                  name={showCfmPwd ? 'eye' : 'eye-off'}
                  size={24}
                  color={COLOR.primary}
                />
              </TouchableOpacity>
            </View>
            {!!confirmErr && <Text style={styles.err}>{confirmErr}</Text>}


            <TouchableOpacity
              style={[styles.button, { backgroundColor: COLOR.primary }]}
              onPress={submitPassword}
            >
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.cancelBtn]}
              onPress={() => { clearErrors(); setPwdModal(false); }}
            >
              <Text style={[styles.buttonText, styles.cancelTxt]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ─── Styles ─────────────────────────────────────────── */
const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLOR.canvas,
  },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 24,            // wider global padding
  },

  /* header row */
  headerRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.5,
    borderColor: '#E0E0E0',
    zIndex: 5,
  },
  headerLabel: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: COLOR.primary,
  },

  /* banner */
  banner: {
    width: '80%',
    resizeMode: 'contain',
    marginTop: 80,
    marginBottom: 40,
  },

  /* info card */
  infoCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  row: {
    fontSize: 16,
    color: COLOR.primary,
    marginTop: 8,
  },
  labelStrong: { fontWeight: '600', color: COLOR.primary },
  value:       { color: 'rgba(62,87,93,0.9)' },

  /* inputs */
  label: {
    fontSize: 16,
    color: COLOR.primary,
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: COLOR.primary,
    borderRadius: 8,
    padding: 12,
    marginTop: 4,
    backgroundColor: '#FFFFFF',
  },
  // wrap text + icon in a bordered row
  inputContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLOR.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginTop: 4,
    backgroundColor: '#FFFFFF',
  },
  
  // the TextInput inside inputContainer
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },

  /* buttons */
  button: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { color: '#FFF', fontWeight: '600', fontSize: 16 },

  /* outlined primary for launcher */
  outlinedPrimary: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLOR.primary,
  },
  outlinedText: { color: COLOR.primary },

  cancelBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLOR.primary,
  },
  cancelTxt: { color: COLOR.primary },

  /* error text */
  err: {
    color: COLOR.error,
    fontSize: 13,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  errGeneral: {
    color: COLOR.error,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },

  /* modal styling */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
});
