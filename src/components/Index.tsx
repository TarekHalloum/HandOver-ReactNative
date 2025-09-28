// src/components/Index.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { Asset } from 'expo-asset';
import { Video as ExpoVideo, ResizeMode } from 'expo-av';
import type { VideoReadyForDisplayEvent } from 'expo-av';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../navigation/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Navigation prop types
type IndexNavProp = NativeStackNavigationProp<AuthStackParamList, 'Index'>;

export default function Index() {
  const { width } = useWindowDimensions();
  const navigation = useNavigation<IndexNavProp>();
  const videoRef = useRef<ExpoVideo | null>(null);

  // fallback aspect ratio
  const [aspectRatio, setAspectRatio] = useState(16 / 9);

  // get a valid URI for web
  const mp4Asset = Asset.fromModule(require('../assets/video.mp4'));

  // autoplay on native
  useEffect(() => {
    if (Platform.OS !== 'web') {
      videoRef.current?.playAsync();
    }
  }, []);

  // update aspect ratio when video is ready (native)
  const handleReady = (evt: VideoReadyForDisplayEvent) => {
    const { naturalSize } = evt;
    if (naturalSize.width && naturalSize.height) {
      setAspectRatio(naturalSize.width / naturalSize.height);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container} alwaysBounceVertical={false}>

        {/* Logo */}
        <Image
          source={require('../assets/logo.png')}
          style={[styles.logo, { width: width * 0.6 }]}
          resizeMode="contain"
        />

        {/* Video */}
        <View style={[styles.videoWrapper, { aspectRatio }]}>  
          {Platform.OS === 'web' ? (
            <video
              src={mp4Asset.uri}
              autoPlay
              muted
              loop
              playsInline
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              onLoadedMetadata={(e) => {
                const v = e.currentTarget;
                if (v.videoWidth && v.videoHeight) {
                  setAspectRatio(v.videoWidth / v.videoHeight);
                }
              }}
            />
          ) : (
            <ExpoVideo
              ref={videoRef}
              source={require('../assets/video.mp4')}
              style={StyleSheet.absoluteFill}
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay
              isLooping
              isMuted
              onReadyForDisplay={handleReady}
            />
          )}
        </View>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          One app for Home Services, AI-powered Car Diagnostics & Emergency Aid
        </Text>

        {/* Auth buttons */}
        <View style={styles.buttonsRow}>
          <TouchableOpacity
            style={[styles.button, styles.loginButton]}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.buttonText}>Log In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.signUpButton]}
            onPress={() => navigation.navigate('SignUp')}
          >
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
        </View>

<TouchableOpacity
  style={styles.skipLink}
  onPress={async () => {
    try {
      await AsyncStorage.removeItem('@token');    // ← kill the token
    } catch (e) {
      console.warn('Could not clear token:', e);
    }
    navigation.replace('RootTabs', { screen: 'Home',params: {}  });
  }}
>
  <Text style={styles.skipText}>Skip & Enter App →</Text>
</TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// Styles
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f7f6f2',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  logo: {
    height: undefined,
    aspectRatio: 1,
    marginBottom: 20,
  },
  videoWrapper: {
    width: '90%',
    backgroundColor: '#000',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    textAlign: 'center',
    color: '#444',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  buttonsRow: {
    flexDirection: 'row',
    width: '90%',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  loginButton: {
    backgroundColor: '#249BB9',
  },
  signUpButton: {
    backgroundColor: '#3E575D',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  skipLink: {
    marginTop: 8,
  },
  skipText: {
    color: '#249BB9',
    fontSize: 13,
  },
});
