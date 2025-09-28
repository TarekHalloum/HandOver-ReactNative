// src/screens/EmergencyChoiceScreen.tsx
import React from 'react';
import {
  ScrollView,
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Logo from '../components/Logo';

/* ------------------------------------------------------------------
 * Colours
 * ---------------------------------------------------------------- */
const COLOR = {
  primary: '#3E575D',
  canvas: '#FAF9F6',
  white: '#FFFFFF',
  textLight: '#868686',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function EmergencyChoiceScreen() {
  const nav = useNavigation<any>();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: 'flex-start',        
        paddingTop: 0,
        paddingBottom: insets.bottom + 24,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Hands visual banner */}
      <Image
        source={require('../assets/hands.png')}
        style={[styles.bannerImg, { marginTop: -70}]}  // pulled further up under header
        resizeMode="contain"
      />

      {/* Actions (cards) */}
      <View style={styles.cardsBox}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => nav.navigate('EmergencyDonate')}
          activeOpacity={0.85}
        >
          <Image
            source={require('../assets/donate.png')}
            style={styles.cardImg}
            resizeMode="contain"
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Donate Supplies</Text>
            <Text style={styles.cardSub}>Give items to those in need</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => nav.navigate('EmergencyReceive')}
          activeOpacity={0.85}
        >
          <Image
            source={require('../assets/request.png')}
            style={styles.cardImg}
            resizeMode="contain"
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Request Aid</Text>
            <Text style={styles.cardSub}>Receive items in an emergency</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Logo */}
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
  bannerImg: {
    width: '110%',        // extend beyond screen for more coverage
    aspectRatio: 2.5,     // wider image proportions
    alignSelf: 'center',
  },
  cardsBox: {
    width: '90%',
    alignSelf: 'center',
  },
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
  cardSub: { color: COLOR.textLight, fontSize: 12, marginTop: 2 },
  chevron: { color: COLOR.primary, fontSize: 22, marginLeft: 6, fontWeight: 'bold' },
  logoContainer: {
    alignItems: 'center',
    marginTop: 'auto',
  },
});
