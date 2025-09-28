// File: src/screens/DonationScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RootTabsParamList } from '../navigation/types';

type DonationNavProp = BottomTabNavigationProp<RootTabsParamList, 'Supplier'>;

export default function DonationScreen() {
  const navigation = useNavigation<DonationNavProp>();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Make a Donation</Text>
      <Text style={styles.subtitle}>Select an item or cash donation to help others:</Text>

      {/* TODO: Replace with real donation form components */}
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => Alert.alert('Coming Soon', 'Donation flow goes here')}
      >
        <Text style={styles.buttonText}>Donate Now</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.backLink} 
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.linkText}>Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0059AA',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666666',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#28a745',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  backLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#0059AA',
    textDecorationLine: 'underline',
  },
});
