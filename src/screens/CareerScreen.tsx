// src/screens/CareerScreen.tsx
// HandOver ▸ Careers
// Palette: #3E575D • #EFE7DC • #FAF9F6 • #FFFFFF

import React from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Logo from '../components/Logo';

const CAREERS_BANNER = require('../assets/careers.png');
const HERO_HEIGHT = 180; // tweak this

/* keep banner ratio if needed */
let imgW = 1, imgH = 1;
if (Platform.OS !== 'web') {
  // @ts-ignore
  const src = (Image as any).resolveAssetSource(CAREERS_BANNER);
  imgW = src.width;
  imgH = src.height;
}
const bannerRatio = imgW / imgH;

const benefits = [
  { key: 'Innovative Culture', desc: 'Join a dynamic team reshaping service delivery.' },
  { key: 'Impactful Work',     desc: 'Your contributions directly shape our users’ experiences.' },
  { key: 'Growth Opportunities', desc: 'Learn, develop, and advance within the company.' },
  { key: 'Collaborative Environment', desc: 'Be part of a supportive, communication-driven community.' },
];

export default function CareerScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  return (
    <ScrollView
      style={styles.root}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom + 24,
      }}
    >
      {/* Header Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.topBarBack}>
          <Ionicons name="arrow-back" size={24} color="#3E575D" />
        </TouchableOpacity>
        <Ionicons
          name="briefcase-outline"
          size={24}
          color="#3E575D"
          style={{ marginHorizontal: 8 }}
        />
        <Text style={styles.topBarTitle}>Careers</Text>
      </View>

      {/* Hero Banner */}
      <View style={[styles.heroContainer, { height: HERO_HEIGHT }]}>
        <Image
          source={CAREERS_BANNER}
          style={styles.heroImage}
          resizeMode="contain"
        />
      </View>

      {/* Intro */}
      <Text style={[styles.subHeader]}>Join Our Team and Shape the Future</Text>
      <Text style={styles.body}>
        At HandOver, we innovate continuously to connect users with essential
        services and emergency aid. We’re always looking for exceptional
        individuals to grow with us.
      </Text>

      {/* Benefits */}
      <Text style={[styles.subHeader, { marginTop: 24 }]}>
        Why Choose a Career at HandOver
      </Text>
      <FlatList
        data={benefits}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <View style={styles.bulletItem}>
            <Text style={styles.bulletTitle}>• {item.key}</Text>
            <Text style={styles.bulletDesc}>{item.desc}</Text>
          </View>
        )}
      />

      {/* How to Apply */}
      <Text style={[styles.subHeader, { marginTop: 24 }]}>How to Apply</Text>
      <Text style={styles.body}>
        To apply, send your résumé and a brief cover letter via our contact
        page.
      </Text>
      <TouchableOpacity
        style={styles.applyButton}
        onPress={() => navigation.navigate('Contact')}
      >
        <Text style={styles.applyButtonText}>Contact Us</Text>
      </TouchableOpacity>

      {/* Footer Logo (now just part of content) */}
      <View style={styles.logoContainer}>
        <Logo />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  topBarBack: {
    padding: 4,
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3E575D',
  },
  heroContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  heroImage: {
    width: '65%',
    height: '100%',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#3E575D',
    textAlign: 'center',
    marginHorizontal: 20,
    marginBottom: 12,
  },
  subHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3E575D',
    marginHorizontal: 20,
    marginBottom: 8,
  },
  body: {
    fontSize: 14,
    color: '#1F2D3D',
    lineHeight: 24,
    marginHorizontal: 20,
    textAlign: 'left',
  },
  bulletItem: {
    marginVertical: 8,
    marginHorizontal: 20,
  },
  bulletTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#3E575D',
  },
  bulletDesc: {
    fontSize: 14,
    color: '#1F2D3D',
    marginLeft: 12,
    marginTop: 4,
  },
  applyButton: {
    alignSelf: 'center',
    backgroundColor: '#3E575D',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 6,
    marginTop: 16,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
});
