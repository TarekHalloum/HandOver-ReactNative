// src/screens/TermsScreen.tsx
// HandOver ▸ Terms & Conditions
// Palette: #3E575D • #EFE7DC • #FAF9F6 • #FFFFFF

import React from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Logo from '../components/Logo';

const COLOR = {
  primary: '#3E575D',
  canvas: '#FAF9F6',
  white: '#FFFFFF',
};

const HERO_IMG = require('../assets/terms.png');
const HERO_TOP = 0;
const HERO_BOTTOM = 16;

export default function TermsScreen() {
  const insets = useSafeAreaInsets();
  const nav = useNavigation();

  return (
    <View style={styles.container}>
      {/* Safe-area header, flush to top */}
      <View style={{ paddingTop: insets.top, backgroundColor: COLOR.canvas }}>
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => nav.goBack()}
            style={{ padding: 8 }}
          >
            <Ionicons name="arrow-back" size={24} color={COLOR.primary} />
          </TouchableOpacity>
          <View style={styles.topBarTitle}>
            <Ionicons
              name="document-text-outline"
              size={20}
              color={COLOR.primary}
            />
            <Text style={styles.header}>Terms And Conditions</Text>
          </View>
        </View>
      </View>

      {/* Scrollable content starts below */}
      <ScrollView
        contentContainerStyle={{
          paddingTop: 24,                      // the 24px “hero gap”
          paddingBottom: insets.bottom + 24,   // logo sits 24px above bottom
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <Image
          source={HERO_IMG}
          style={[styles.hero, { marginTop: HERO_TOP - 32, marginBottom: HERO_BOTTOM }]}
          resizeMode="contain"
        />

        {/* 1 – 7 unchanged -------------------------------------------------- */}
        <View style={styles.section}>
          <Text style={styles.title}>1. Acceptance of Terms</Text>
          <Text style={styles.body}>
            By using the HandOver mobile application, you agree to these
            Terms &amp; Conditions and our Privacy Policy. If you do not agree,
            please discontinue use.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>2. Use of Service</Text>
          <Text style={styles.body}>
            HandOver grants you a limited, non-exclusive license to access and
            use the App. You agree not to misuse or interfere with the service
            or attempt unauthorized access.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>3. User Responsibilities</Text>
          <Text style={styles.body}>
            You are responsible for providing accurate information when creating
            posts or requests, and for all activity under your account. Do not
            share your credentials.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>4. Intellectual Property</Text>
          <Text style={styles.body}>
            All content, logos, and materials in the App are the property of
            HandOver or its licensors and are protected by intellectual-property
            laws. You must not reproduce or distribute without permission.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>5. Limitation of Liability</Text>
          <Text style={styles.body}>
            HandOver is not liable for indirect, incidental, or consequential
            damages arising from your use of the App. Our total liability will
            not exceed the fees paid by you in the past 12 months.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>6. Governing Law</Text>
          <Text style={styles.body}>
            These Terms are governed by the laws of the jurisdiction where
            HandOver is registered, without regard to conflict-of-laws
            principles.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>7. Changes to Terms</Text>
          <Text style={styles.body}>
            We may update these Terms &amp; Conditions periodically. The “Last
            Updated” date at the top of the screen will indicate the effective
            date. Continued use constitutes acceptance.
          </Text>
        </View>

        {/* 9. Contact Us (tap to navigate) ---------------------------------- */}
        <TouchableOpacity
          style={[styles.section, styles.contactSection]}
          onPress={() => nav.navigate('Contact' as never)}
          activeOpacity={0.8}
        >
          <Text style={styles.title}>9. Contact Us</Text>
          <Text style={styles.body}>
            For questions or concerns, press here to be redirected to our
            Contact page.
          </Text>
        </TouchableOpacity>

        {/* Logo – 24 px above safe-area bottom ------------------------------- */}
        <View style={styles.logoContainer}>
          <Logo />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLOR.canvas,
  },
  hero: {
    width: '65%',
    height: 180,
    alignSelf: 'center',
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
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLOR.primary,
    marginBottom: 8,
  },
  body: {
    fontSize: 14,
    color: '#1F2D3D',
    lineHeight: 20,
  },
  contactSection: {
    // customize if needed
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLOR.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  topBarTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  header: {
    fontSize: 18,
    fontWeight: '600',
    color: COLOR.primary,
    marginLeft: 8,
  },
});
