// src/screens/Help.tsx
// HandOver ▸ Help (all content scrolls; hero at 65% width; intro paragraph below hero)
import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Logo from '../components/Logo';

const COLOR = {
  primary: '#3E575D',
  accent: '#EFE7DC',
  canvas: '#FAF9F6',
  white: '#FFFFFF',
};
const BOTTOM_GAP = 24;
const HERO_IMAGE = require('../assets/help.png');

type PanelKey = 'how' | 'about' | 'contact';
interface Panel {
  key: PanelKey;
  image: any;
  title: string;
  body?: string[];
}

export default function HelpScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const nav = useNavigation<any>();
  const [active, setActive] = useState<PanelKey | null>(null);

  // Determine hero dimensions
  let heroOrigW = 1, heroOrigH = 1;
  if (Platform.OS !== 'web') {
    const src = Image.resolveAssetSource(HERO_IMAGE);
    heroOrigW = src.width;
    heroOrigH = src.height;
  }
  const HERO_WIDTH = width * 0.65;
  const HERO_HEIGHT = (heroOrigH / heroOrigW) * HERO_WIDTH;

  const PANEL_WIDTH = width * 0.8;
  const PANEL_HEIGHT = width * 0.4;

  const panels: Panel[] = [
    {
      key: 'how',
      image: require('../assets/howitworks.png'),
      title: 'How It Works',
      body: [
        'HandOver connects you to services and aid in three simple steps:',
        '1. Post your task or scan.',
        '2. Choose a provider.',
        '3. Track and receive assistance',
      ],
    },
    {
      key: 'about',
      image: require('../assets/aboutus.png'),
      title: 'About Us',
      body: [
        'We are dedicated to making help accessible.',
        'Our mission is to build a connected community',
        'where everyone can find and offer support anytime.',
      ],
    },
    {
      key: 'contact',
      image: require('../assets/contactus.png'),
      title: 'Contact Us',
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: insets.bottom }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.headerBox}>
        <TouchableOpacity onPress={() => nav.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLOR.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Ionicons name="help-circle-outline" size={20} color={COLOR.primary} />
          <Text style={styles.headerTitle}>Help</Text>
        </View>
        <View style={{ flex: 1 }} />
      </View>

<View
  style={{
    width: HERO_WIDTH,
    height: HERO_HEIGHT,
    alignSelf: 'center',
   marginTop: -60,
   marginBottom: -30,    
  }}
>
  <Image
    source={HERO_IMAGE}
    style={{ width: '100%', height: '100%' }}
    resizeMode="contain"
  />
</View>

      {/* Intro Paragraph */}
      <View style={styles.introBox}>
        <Text style={styles.introText}>
          Tap any of the images below to explore each section
        </Text>
      </View>

      {/* Panels */}
      <View style={styles.panelsWrapper}>
        {panels.map((panel) => (
          <View
            key={panel.key}
            style={[styles.panelContainer, { width: PANEL_WIDTH, height: PANEL_HEIGHT }]}>
            {active === panel.key ? (
              <TouchableOpacity
                style={[styles.card, { width: PANEL_WIDTH, height: PANEL_HEIGHT }]}
                onPress={() => setActive(null)}>
                <Text style={styles.cardTitle}>{panel.title}</Text>
                {panel.body?.map((line, i) => (
                  <Text key={i} style={styles.cardBody}>
                    {line}
                  </Text>
                ))}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() =>
                  panel.key === 'contact' ? nav.navigate('Contact') : setActive(panel.key)
                }>
                <Image
                  source={panel.image}
                  style={{ width: PANEL_WIDTH, height: PANEL_HEIGHT }}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>

      {/* Logo */}
      <View style={styles.logoBox}>
        <Logo />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLOR.canvas },
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
  introBox: {
    marginHorizontal: 24,
  },
  introText: {
    fontSize: 14,
    color: COLOR.primary,
    textAlign: 'center',
    lineHeight: 20,
  },
  panelsWrapper: {
    alignItems: 'center',
    paddingTop: 24,
  },
  panelContainer: {
    marginBottom: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: COLOR.white,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: COLOR.accent,
    justifyContent: 'flex-start',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLOR.primary,
    marginBottom: 8,
    textAlign: 'center',
    alignSelf: 'center',
  },
  cardBody: {
    fontSize: 14,
    color: '#1F2D3D',
    lineHeight: 20,
    marginVertical: 2,
    textAlign: 'left',
    alignSelf: 'flex-start',
  },
  logoBox: {
    alignItems: 'center',
    paddingVertical: BOTTOM_GAP,
  },
});
