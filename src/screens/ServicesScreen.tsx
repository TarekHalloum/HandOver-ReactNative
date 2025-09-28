// src/screens/ServicesScreen.tsx
// HandOver ▸ Service hub – banner top • services centred • logo bottom (uniform footer gap)
// Palette: #3E575D • #EFE7DC • #FAF9F6 • #FFFFFF
// -----------------------------------------------------------------------------
import React, { useState, useCallback } from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  Text,
} from 'react-native';
import { useNavigation, useFocusEffect, CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

// Helper nav hook
const useNav = () => useNavigation<any>();

/* ------------------------------------------------------------------ 
 * Utility: safe aspect-ratio lookup (works on web + native) 
 * ---------------------------------------------------------------- */
function getAspectRatio(img: any, fallback: number): number {
  const resolver = Image?.resolveAssetSource;
  if (typeof resolver === 'function') {
    // @ts-ignore
    const { width: w, height: h } = resolver(img) ?? {};
    if (w && h) return w / h;
  }
  return fallback;
}

/* ------------------------------------------------------------------ 
 * Service card component 
 * ---------------------------------------------------------------- */
interface ServiceCardProps {
  title: string;
  subtitle: string;
  features: string;
  img: any;
  onPress: () => void;
}

function ServiceCard({ title, subtitle, features, img, onPress }: ServiceCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <Image source={img} style={styles.cardImg} resizeMode="contain" />
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardSub}>{subtitle}</Text>
        <Text style={styles.cardFeat}>{features}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

/* ------------------------------------------------------------------ 
 * ServicesScreen component 
 * ---------------------------------------------------------------- */
export default function ServicesScreen() {
  const nav = useNav();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Refresh auth state on focus
  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem('@token').then(token => {
        setIsAuthenticated(!!token);
      });
    }, [])
  );

  const BOTTOM_GAP = 24;
  const chooseImg = require('../assets/choose.png');
  const chooseRatio = getAspectRatio(chooseImg, 2.2);

  // Unauthenticated placeholder: show login prompt, back returns to welcome
  if (!isAuthenticated) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: 'center', alignItems: 'center', paddingTop: insets.top, paddingBottom: insets.bottom + BOTTOM_GAP }
        ]}
      >  
        <Text style={styles.placeholderText}>
          Login to be able to choose a service
        </Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() =>
            nav.dispatch(
              CommonActions.reset({
                index: 1,
                routes: [
                  { name: 'Index' },
                  { name: 'Login' }
                ]
              })
            )
          }
          activeOpacity={0.8}
        >
          <Text style={styles.loginButtonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Normal service selection UI
  const handlePress = (screenName: string, params?: any) => {
    nav.navigate(screenName as never, params as never);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ flexGrow: 1, paddingTop: insets.top }}
      showsVerticalScrollIndicator={false}
    >
      {/* 1️⃣ Banner */}
      <View style={styles.bannerBox}>
        <Image
          source={chooseImg}
          style={{ width: width * 0.65, aspectRatio: chooseRatio }}
          resizeMode="contain"
        />
      </View>

      {/* 2️⃣ Centre-aligned service list */}
      <View style={styles.cardsBox}>
        <ServiceCard
          title="Home Services"
          subtitle="Search for your need • Or scan your floor or wall"
          features="Our AI detects the colors from a given photo"
          img={require('../assets/home.png')}
          onPress={() => handlePress('HomeCategory')}
        />
        <ServiceCard
          title="Vehicle Services"
          subtitle="Scan your car for diagnostics"
          features="Send a ticket to a mechanic"
          img={require('../assets/vehicle.png')}
          onPress={() => handlePress('VehicleCategory')}
        />
        <ServiceCard
          title="Emergency Aid"
          subtitle="Money • Food • Shelter • Mattresses"
          features="Request help or donate in an emergency"
          img={require('../assets/aid.png')}
          onPress={() => handlePress('EmergencyChoice')}
        />
      </View>

      {/* 3️⃣ Logo pinned to bottom */}
      <View style={{ alignItems: 'center', paddingBottom: insets.bottom + BOTTOM_GAP }}>
        <Logo />
      </View>
    </ScrollView>
  );
}

/* ------------------------------------------------------------------ 
 * Stylesheet 
 * ---------------------------------------------------------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLOR.canvas,
  },
  bannerBox: {
    alignItems: 'center',
    marginTop: 80,
    marginBottom: 12,
  },
  cardsBox: {
    width: '90%',
    maxWidth: 600,
    flexGrow: 1,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  /* Service card */
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLOR.white,
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: COLOR.primary,
  },
  cardImg: { width: 50, height: 50, marginRight: 12 },
  cardTitle: { color: COLOR.primary, fontSize: 15, fontWeight: 'bold' },
  cardSub: { color: '#1F2D3D', fontSize: 12, marginTop: 2 },
  cardFeat: { color: '#868686', fontSize: 11, marginTop: 2 },
  chevron: { color: COLOR.primary, fontSize: 22, marginLeft: 6, fontWeight: 'bold' },
  placeholderText: {
    fontSize: 18,
    color: COLOR.primary,
    marginBottom: 16,
  },
  loginButton: {
    backgroundColor: COLOR.primary,
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  loginButtonText: {
    color: COLOR.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
