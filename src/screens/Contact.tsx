// src/screens/Contact.tsx
// HandOver ▸ Contact Us (prefills name/email when authenticated)
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Logo from '../components/Logo';

const COLOR = {
  primary: '#3E575D',
  accent: '#EFE7DC',
  canvas: '#FAF9F6',
  white: '#FFFFFF',
};
const BOTTOM_GAP = 24;
const API_URL = 'http://20.174.11.55/api';

export default function ContactScreen() {
  const insets = useSafeAreaInsets();
  const nav = useNavigation<any>();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  // On mount, try to load profile info
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('@token');
        if (!token) return;

        const endpoint =`${API_URL}/user`;

        const resp = await fetch(endpoint, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (resp.ok) {
          const data = await resp.json();
          if (data.username || data.name) {
            setName(data.username || data.name);
          }
          if (data.email) {
            setEmail(data.email);
          }
        }
      } catch (err) {
        console.log('Failed to load profile:', err);
      }
    };

    loadProfile();
  }, []);

  const handleSend = async () => {
    try {
      const token = await AsyncStorage.getItem('@token');
      if (!token) {
        Alert.alert('Error', 'No token found. Please log in again.');
        return;
      }

      const response = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          email,
          message,
        }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Message sent!');
        setName('');
        setEmail('');
        setMessage('');
      } else {
        const errorData = await response.json();
        console.error('Failed to send message:', errorData);
        Alert.alert('Error', errorData.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error while sending message:', error);
      Alert.alert('Error', 'An error occurred while sending your message.');
    }
  };
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerBox}>
        <TouchableOpacity onPress={() => nav.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLOR.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Ionicons name="call-outline" size={20} color={COLOR.primary} />
          <Text style={styles.headerTitle}>Contact Us</Text>
        </View>
        <View style={{ flex: 1 }} />
      </View>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: 32,
          paddingBottom: insets.bottom,
          alignItems: 'center',
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image */}
        <Image
          source={require('../assets/contactus.png')}
          style={styles.contactImage}
          resizeMode="contain"
        />

        {/* Form Card */}
        <View style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder="Your Name"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Your Email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Your Message"
            multiline
            value={message}
            onChangeText={setMessage}
          />
          <TouchableOpacity
            style={styles.button}
            onPress={handleSend}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Send Message</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Logo fixed gap */}
      <View style={{ alignItems: 'center', paddingVertical: BOTTOM_GAP }}>
        <Logo />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLOR.canvas,
  },
  headerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: COLOR.white,
    borderBottomWidth: 1,
    borderColor: COLOR.accent,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  headerTitle: {
    color: COLOR.primary,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  card: {
    backgroundColor: COLOR.white,
    borderRadius: 8,
    padding: 20,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: COLOR.accent,
  },
  input: {
    borderWidth: 1,
    borderColor: COLOR.primary,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 14,
    backgroundColor: COLOR.white,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: COLOR.primary,
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: COLOR.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  contactImage: {
    width: 250,
    height: 250,
    marginBottom: 16,
  },
});