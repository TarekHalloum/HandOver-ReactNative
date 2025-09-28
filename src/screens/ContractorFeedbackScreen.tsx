// src/screens/ContractorFeedbackScreen.tsx
// HandOver ▸ Contractor Feedback page
// -----------------------------------------------------------------------------
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../navigation/types';

// Route & navigation typing
type NavProp = NativeStackNavigationProp<AuthStackParamList, 'ContractorFeedback'>;

export default function ContractorFeedbackScreen() {
  const route = useRoute<import('@react-navigation/native').RouteProp<AuthStackParamList, 'ContractorFeedback'>>();
  const navigation = useNavigation<NavProp>();
  const { requestId, fullName } = route.params;
  const [feedback, setFeedback] = useState('');

  const submit = () => {
    // TODO: integrate API call to save feedback
    Alert.alert('Feedback Submitted', `Feedback for ${fullName}'s request saved.`);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Feedback for Request #{requestId}</Text>
      <Text style={styles.subtitle}>Service requested by {fullName}</Text>
      <TextInput
        style={styles.textArea}
        multiline
        placeholder="Enter your feedback and pricing here..."
        value={feedback}
        onChangeText={setFeedback}
      />
      <TouchableOpacity style={styles.button} onPress={submit}>
        <Text style={styles.buttonText}>Submit Feedback</Text>
      </TouchableOpacity>
    </View>
  );
}

const COLOR = { primary: '#3E575D', canvas: '#FAF9F6', white: '#FFFFFF' };
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLOR.canvas,
    padding: 16,
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: COLOR.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  textArea: {
    backgroundColor: COLOR.white,
    borderColor: '#EFE7DC',
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  button: {
    backgroundColor: COLOR.primary,
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: COLOR.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
