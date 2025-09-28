// src/screens/MoreScreen.tsx
// HandOver ▸ More hub – icon top • options centred • logo bottom
// Palette: #3E575D • #EFE7DC • #FAF9F6 • #FFFFFF

import React, { useState, useCallback } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CommonActions } from '@react-navigation/native';

import Logo from '../components/Logo';

const COLOR = {
  primary: '#3E575D',
  accent: '#EFE7DC',
  canvas: '#FAF9F6',
  white: '#FFFFFF',
};

const x = 2;
const y = x * 50;
const BOTTOM_GAP = 24;

interface RowProps {
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
}
function Row({ icon, label, onPress }: RowProps) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      {icon}
      <Text style={styles.rowLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={COLOR.primary} />
    </TouchableOpacity>
  );
}

export default function MoreScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState<string|null>(null);

  // Refresh auth state on focus
useFocusEffect(
  useCallback(() => {
    AsyncStorage.multiGet(['@token','@userType']).then(
      ([[, token],[, type]]) => {
        setIsAuthenticated(!!token);
        setUserType(type);      // 'client' or 'contractor'
      }
    );
  }, [])
);


  const handleLogout = async () => {
    await AsyncStorage.multiRemove(['@token', '@userType']);
    setIsAuthenticated(false);
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Index' }],
      })
    );
  };

  return (
    <View style={styles.container}>
      {/* SCROLLABLE CONTENT */}
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top }}
        showsVerticalScrollIndicator={false}
      >
        {/* 1️⃣ Top gap */}
        <View style={{ height: y }} />

        {/* 2️⃣ Icon banner */}
        <View style={styles.bannerBox}>
          <Image
            source={require('../assets/more.png')}
            style={{ width: width * 0.5, aspectRatio: 4.5 }}
            resizeMode="contain"
          />
        </View>

        {/* 3️⃣ Gap after banner */}
        <View style={{ height: y }} />

        {/* 4️⃣ Centre-aligned option list */}
        <View style={styles.cardsBox}>

          {/* Guest: Log in */}
          {!isAuthenticated && (
            <Row
              icon={<Ionicons name="log-in-outline" size={20} color={COLOR.primary} />}
              label="Log in"
              onPress={() => navigation.navigate('Login')}
            />
          )}

         {/* Authenticated client */}
        {isAuthenticated && userType==='client' && (
          <>
            <Row icon={<Ionicons name="person-outline" size={20} color={COLOR.primary}/>}
                label="Profile"       onPress={() => navigation.navigate('Profile')}   />
            <Row icon={<Ionicons name="list-outline"   size={20} color={COLOR.primary}/>}
                label="Post your task" onPress={() => navigation.navigate('Services')}  />
            <Row icon={<Ionicons name="camera-outline" size={20} color={COLOR.primary}/>}
                label="Scan"           onPress={() => navigation.navigate('Scan')}      />
            <Row icon={<Ionicons name="images-outline" size={20} color={COLOR.primary}/>}
                label="Vehicle Scans"       onPress={() => navigation.navigate('MyScans')}   />
            <Row icon={<Ionicons name="clipboard-outline" size={20} color={COLOR.primary}/>}
                label="My Requests"    onPress={() => navigation.navigate('MyRequests')}/>
            <Row icon={<Ionicons name="log-out-outline" size={20} color={COLOR.primary}/>}
                label="Log out"        onPress={handleLogout}                           />
          </>
        )}

        {/* Authenticated contractor */}
        {isAuthenticated && userType==='contractor' && (
          <>
            <Row icon={<Ionicons name="person-outline"       size={20} color={COLOR.primary}/>}
                label="Profile"    onPress={() => navigation.navigate('Profile')}    />

            <Row icon={<Ionicons name="log-out-outline"      size={20} color={COLOR.primary}/>}
                label="Log out"    onPress={handleLogout}                            />
          </>
        )}

          {/* 5️⃣ Gap between auth/guest and common options */}
          <View style={{ height: y / 4 }} />

          {/* Common options */}
          <Row
            icon={<Ionicons name="call-outline" size={20} color={COLOR.primary} />}
            label="Contact us"
            onPress={() => navigation.navigate('Contact')}
          />
          <Row
            icon={<Ionicons name="business-outline" size={20} color={COLOR.primary} />}
            label="Advertise with us"
            onPress={() => navigation.navigate('MySupplier')}
          />
          <Row
            icon={<Ionicons name="briefcase-outline" size={20} color={COLOR.primary} />}
            label="Careers"
            onPress={() => navigation.navigate('CareerScreen')}
          />
          <Row
            icon={<Ionicons name="lock-closed-outline" size={20} color={COLOR.primary} />}
            label="Privacy Policy"
            onPress={() => navigation.navigate('PrivacyScreen')}
          />
          <Row
            icon={<Ionicons name="document-text-outline" size={20} color={COLOR.primary} />}
            label="Terms & Conditions"
            onPress={() => navigation.navigate('TermsScreen')}
          />
          <Row
            icon={<Ionicons name="help-circle-outline" size={20} color={COLOR.primary} />}
            label="Help"
            onPress={() => navigation.navigate('Help')}
          />

          {/* bottom padding so last row isn’t hidden */}
          <View style={{ height: BOTTOM_GAP }} />
        </View>
      </ScrollView>

      {/* FIXED FOOTER: logo */}
      <View style={{ alignItems: 'center', paddingBottom: insets.bottom + BOTTOM_GAP }}>
        <Logo />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLOR.canvas },
  bannerBox: { alignItems: 'center' },
  cardsBox: {
    width: '90%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLOR.white,
    borderRadius: 8,
    padding: x,
    marginBottom: x,
    borderWidth: 1,
    borderColor: COLOR.accent,
  },
  rowLabel: {
    flex: 1,
    marginLeft: x,
    color: COLOR.primary,
    fontSize: 16,
  },
});
