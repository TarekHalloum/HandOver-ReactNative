// src/screens/PrivacyScreen.tsx
// HandOver ▸ Privacy Policy
// Palette: #3E575D • #EFE7DC • #FAF9F6 • #FFFFFF

import React from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Image,
  Platform,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Logo from '../components/Logo';

const HERO_IMAGE = require('../assets/privacy.png');
const COLOR = {
  primary: '#3E575D',
  canvas: '#FAF9F6',
  white: '#FFFFFF',
};

let imgW = 1, imgH = 1;
if (Platform.OS !== 'web') {
  // @ts-ignore
  const src = (Image as any).resolveAssetSource(HERO_IMAGE);
  imgW = src.width;
  imgH = src.height;
}
const bannerRatio = imgW / imgH;

export default function PrivacyScreen() {
  const insets = useSafeAreaInsets();
  const nav = useNavigation();
  const { width } = useWindowDimensions();
  const HERO_WIDTH = Math.min(width * 0.65, 320);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* ─── Privacy Header Bar ─────────────────────────────────────────── */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => nav.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLOR.primary} />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color={COLOR.primary}
          />
          <Text style={styles.headerText}>Privacy And Policy</Text>
        </View>
      </View>

      {/* hero header */}
      <View style={styles.heroContainer}>
        <Image
          source={HERO_IMAGE}
          style={{
            width: HERO_WIDTH * 4,
            height: HERO_WIDTH / 3,
            resizeMode: 'contain',
          }}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. Introduction</Text>
        <Text style={styles.sectionBody}>
          At HandOver, your privacy and data security are
          paramount. This policy explains how we collect, use, disclose, and
          protect your personal information when you use our mobile application.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. Information We Collect</Text>
        <Text style={styles.sectionBody}>
          • <Text style={styles.bold}>Personal Information:</Text> Name, email,
          phone number, address.
        </Text>
        <Text style={styles.sectionBody}>
          • <Text style={styles.bold}>Usage Data:</Text> Device logs, browser
          type, operating system.
        </Text>
        <Text style={styles.sectionBody}>
          • <Text style={styles.bold}>Location Data:</Text> Geolocation to
          connect you with nearby providers (with your consent).
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>3. How We Use Information</Text>
        <Text style={styles.sectionBody}>
          We use collected data to deliver and improve services, send
          notifications, personalize user experience, and comply with legal
          obligations.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>4. Disclosure of Your Information</Text>
        <Text style={styles.sectionBody}>
          We share data only with service providers, contractors, or law
          enforcement when required by law or to facilitate service delivery.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>5. Data Security</Text>
        <Text style={styles.sectionBody}>
          We implement industry-standard safeguards to protect your data.
          However, no transmission over the internet is 100 % secure.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>6. Your Choices</Text>
        <Text style={styles.sectionBody}>
          You may access, update, or delete your information at any time via the
          App settings. For marketing preferences, adjust your notification
          settings.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>7. Children's Privacy</Text>
        <Text style={styles.sectionBody}>
          Our App is not intended for children under 13. If we learn we have
          inadvertently collected data from a child under 13, we will delete it.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>8. Changes to This Policy</Text>
        <Text style={styles.sectionBody}>
          We may update this policy to reflect changes in our practices.
        </Text>
      </View>

      {/* Contact – tap to open Contact screen */}
      <TouchableOpacity
        style={[styles.section, styles.contactSection]}
        onPress={() => nav.navigate('Contact' as never)}
        activeOpacity={0.8}
      >
        <Text style={styles.sectionTitle}>9. Contact Us</Text>
        <Text style={styles.sectionBody}>
          For questions or concerns, Press here to be redirected to our Contact
          page.
        </Text>
      </TouchableOpacity>

      {/* logo (scrolls with content) */}
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

  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLOR.primary,
    marginLeft: 8,
  },


  section: {
    backgroundColor: COLOR.white,
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLOR.primary,
  },
  contactSection: {
    // optional overrides
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLOR.primary,
    marginBottom: 8,
  },
  sectionBody: {
    fontSize: 14,
    color: '#1F2D3D',
    lineHeight: 20,
  },
  bold: {
    fontWeight: 'bold',
  },

  logoContainer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 24,
  },
    headerContainer: {
    backgroundColor: COLOR.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 0,
    marginBottom: 12,
  },


  /* tighter top spacing for the hero image */
  heroContainer: {
    alignItems: 'center',
    paddingTop: 24,
    marginBottom: 70,
  },
});