// src/screens/EmergencyDonateScreen.tsx
// HandOver ▸ Emergency Aid – Donate Supplies
// Palette: #3E575D • #EFE7DC • #FAF9F6 • #FFFFFF
// -----------------------------------------------------------------------------
import React from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Logo from '../components/Logo';

/* ------------------------------------------------------------------
 * Colours
 * ---------------------------------------------------------------- */
const COLOR = {
  primary: '#3E575D',
  accent: '#EFE7DC',
  canvas: '#FAF9F6',
  white: '#FFFFFF',
};

export default function EmergencyDonateScreen() {
  const nav = useNavigation<any>();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // form state would be added here
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 24, paddingBottom: insets.bottom + 24 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <Text style={styles.title}>Donate Supplies</Text>

      {/* Form fields */}
      <View style={styles.field}>
        <Text style={styles.label}>Item Name</Text>
        <TextInput style={styles.input} placeholder="e.g. Blankets" />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Quantity</Text>
        <TextInput style={styles.input} placeholder="e.g. 10" keyboardType="numeric" />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Additional Details</Text>
        <TextInput
          style={[styles.input, { height: 100 }]}
          placeholder="Optional notes"
          multiline
        />
      </View>

      {/* Submit */}
      <TouchableOpacity
        style={styles.submitBtn}
        onPress={() => {
          /* handle submit & navigate back */
          nav.goBack();
        }}
      >
        <Text style={styles.submitText}>Submit Donation</Text>
      </TouchableOpacity>

      {/* Logo at bottom */}
      <View style={styles.logoContainer}>
        <Logo />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLOR.canvas,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLOR.primary,
    marginBottom: 24,
    textAlign: 'center',
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: COLOR.primary,
    marginBottom: 4,
  },
  input: {
    backgroundColor: COLOR.white,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLOR.primary,
  },
  submitBtn: {
    backgroundColor: COLOR.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitText: {
    color: COLOR.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 32,
  },
});
