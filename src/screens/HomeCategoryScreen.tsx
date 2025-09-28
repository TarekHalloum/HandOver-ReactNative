// src/screens/HomeCategoryScreen.tsx
// HandOver ▸ Home-services catalogue
// Palette : #3E575D • #EFE7DC • #FAF9F6 • #FFFFFF
// ---------------------------------------------------------------------------
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  useWindowDimensions,
  ScrollView,
  ActivityIndicator,
  Platform,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Logo from '../components/Logo';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';


/* ------------------------------------------------------------------
 * Constants
 * ---------------------------------------------------------------- */
const COLOR = {
  primary: '#3E575D',
  canvas: '#FAF9F6',
  white: '#FFFFFF',
};
const BOTTOM_GAP = 24;                // uniform logo-footer spacing
const ICON_HOME = require('../assets/home2.png');

/* ------------------------------------------------------------------
 * Types
 * ---------------------------------------------------------------- */
interface ApiService {
  id: number;
  service_name: string;
}
interface Service {
  id: string;        // string for FlatList.keyExtractor
  name: string;
  icon: any; 
}

/* ------------------------------------------------------------------
 * Component
 * ---------------------------------------------------------------- */
export default function HomeCategoryScreen() {
  const nav = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [showOverlay, setShowOverlay] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [scannedColor, setScannedColor] = useState<string | null>(null);
  const [closestName, setClosestName] = useState<string | null>(null);
  const [isMatch, setIsMatch] = useState<boolean | null>(null);
  const [loadingScan, setLoadingScan] = useState(false);
  const [data, setData] = useState<Service[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showManual, setShowManual]             = useState(false);
  const [manualColorInput, setManualColorInput] = useState('');
  const [manualErr, setManualErr]               = useState('');
  const buttonWidth = width * 0.6;

  const handleScan = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
      });
      if (result.canceled) return;

      let uri = result.assets[0].uri;
      if (Platform.OS === 'android' && !uri.startsWith('file://')) {
        uri = 'file://' + uri;
      }
      setImageUri(uri);
      setLoadingScan(true);
      setScannedColor(null);

      const resp = await fetch(uri);
      const blob = await resp.blob();

      const formData = new FormData();
      formData.append('image', blob, 'photo.jpg');

      const token = await AsyncStorage.getItem('@token');
      const apiResp = await fetch('http://20.174.11.55/api/detect-color', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await apiResp.json();
      if (!apiResp.ok) throw new Error(data.message || 'Server rejected image');

      setScannedColor(data.hex_detected.toLowerCase());
      setClosestName(data.closest_name);
      setIsMatch(data.match);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Error scanning color');
    } finally {
      setLoadingScan(false);
    }
  };

    const handleApplyManualColor = () => {
      const input = manualColorInput.trim();
      if (!input) {
        setManualErr('Please enter a color.');
        return;
      }
      if (!/^#[0-9A-Fa-f]{6}$/.test(input)) {
        setManualErr('Use the format "#RRGGBB" with hex digits.');
        return;
      }
      setScannedColor(input.toLowerCase());
      setClosestName(input.toLowerCase());
      setIsMatch(true);
      setShowManual(false);
      setManualColorInput('');
      setManualErr('');
    };

  /* ─ Fetch services once ─ */
  useEffect(() => {
    const abort = new AbortController();

    fetch('http://20.174.11.55/api/services/building', {
      headers: {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      signal: abort.signal,
    })
      .then(r => r.json())
      .then((apiData: ApiService[]) => {
        const mapped: Service[] = apiData.map(s => ({
          id: s.id.toString(),
          name: s.service_name,
          icon : ICON_HOME
        }));
        setData(mapped);
      })
      .catch(err => {
        console.error(err);
        if (err.name !== 'AbortError') setError('Impossible de charger les services');
      })
      .finally(() => setLoading(false));

    return () => abort.abort();
  }, []);

  /* ─ Filtered list ─ */
  const shown = useMemo(
    () => data.filter(s => s.name.toLowerCase().includes(query.toLowerCase())),
    [data, query],
  );

  /* ─ Render tile ─ */
  const renderTile = ({ item }: { item: Service }) => (
    <TouchableOpacity
      style={[styles.tile, { width: width / 2 - 24 }]}
      activeOpacity={0.85}
      onPress={() => nav.navigate('ServiceDetails', { id: item.id, name: item.name })}
    >
      <Image source={item.icon} style={styles.icon} resizeMode="contain" />
      <Text numberOfLines={2} style={styles.label}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={[styles.root, { paddingTop: insets.top }]}
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* 👁️ AI Colour Detection card */}
      <TouchableOpacity
        style={styles.aiCard}
        activeOpacity={0.9}
        onPress={() => setShowOverlay(true)}
      >
        <Image
          source={require('../assets/colorScan.png')}
          style={styles.aiIcon}
          resizeMode="contain"
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.aiTitle}>AI Color Detection</Text>
          <Text style={styles.aiHint}>
            To detect the color of the wall, floor … kindly press here
          </Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>

      {/* 🔍 Search */}
      <TextInput
        placeholder="Search for services"
        placeholderTextColor="#666"
        style={styles.search}
        value={query}
        onChangeText={setQuery}
      />

      {/* ⏳ Loading / error */}
      {loading && (
        <ActivityIndicator
          size="large"
          color={COLOR.primary}
          style={{ marginTop: 40 }}
        />
      )}
      {error && !loading && (
        <Text style={{ color: 'red', textAlign: 'center', marginTop: 20 }}>{error}</Text>
      )}

      {/* 📋 Grid */}
      {!loading && (
        <FlatList
          data={shown}
          keyExtractor={s => s.id}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 16 }}
          renderItem={renderTile}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', marginTop: 40, color: '#666' }}>
              Aucun service ne correspond à votre recherche.
            </Text>
          }
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        />
      )}

<Modal
        visible={showOverlay}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowOverlay(false)}
      >
        <View style={styles.overlayContainer}>
          {/* ← Back arrow to close */}
          <TouchableOpacity
            onPress={() => setShowOverlay(false)}
              style={[
                      styles.overlayClose,
                      { top: insets.top + 24 }           // ← NEW
                    ]}

          >
            <Ionicons name="arrow-back" size={24} color={COLOR.primary} />
                </TouchableOpacity>
      <View style={{ alignItems: 'center', marginTop: insets.top + 24 }}>
        <Image
          source={require('../assets/scanp.png')}
          style={{ width: 200, height: 200 }}
          resizeMode="contain"
        />
      </View>
    <View style={styles.middleContainer}>
          {/* ← Scan button */}
          <View style={{ padding: 16 }}>
            <TouchableOpacity
              style={[
                styles.button,
                styles.secondaryButton,
                { width: width * 0.6, alignSelf: 'center' },
                loadingScan && styles.disabled,
              ]}
              onPress={handleScan}
              disabled={loadingScan}
            >
              {loadingScan ? (
                <ActivityIndicator color={COLOR.primary} />
              ) : (
                <>
                  <Ionicons
                    name="camera"
                    size={18}
                    color={COLOR.primary}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={[styles.buttonText, styles.secondaryText]}>
                    Scan
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* ← Show image + color result */}
            {(imageUri || scannedColor) && (
              <View style={styles.resultsContainer}>
                {imageUri && (
                  <Image
                    source={{ uri: imageUri }}
                    style={styles.resultImage}
                  />
                )}
                <View style={styles.resultInfo}>
                  {scannedColor && (
                    <>
                      <Text style={styles.resultLabel}>Detected Color</Text>
                      <View style={styles.colorRow}>
                        <View
                          style={[
                            styles.colorSwatch,
                            { backgroundColor: scannedColor },
                          ]}
                        />
                        <Text style={styles.colorName}>{scannedColor}</Text>
                        {!isMatch && isMatch !== null && (
                          <Text style={[styles.ko, { marginLeft: 6 }]}>
                            (Not 100%)
                          </Text>
                        )}
                      </View>
                    </>
                  )}
                  {isMatch !== null && isMatch && (
                    <Text style={styles.ok}>Match confirmed</Text>
                  )}
                </View>
              </View>
            )}
              {!isMatch && isMatch !== null && (
              <TouchableOpacity
                style={[styles.button, styles.primaryButton ,{ width: width * 0.6, alignSelf: 'center', marginTop: 12 },]}
                onPress={() => setShowManual(true)}
              >
                <Ionicons
                  name="color-palette-outline"
                  size={18}
                  color={COLOR.white}
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.buttonText}>Enter Manually</Text>
              </TouchableOpacity>
            )}

            </View>
      </View>
               <View style={{ alignItems: 'center', marginBottom: insets.bottom + 24 }}>
                <Logo />
               </View>
    </View>
        
        <Modal
          visible={showManual}
          animationType="slide"
          transparent
          onRequestClose={() => setShowManual(false)}
        >
          <View style={styles.manualOverlay}>
            <View style={styles.manualCard}>
              <Text style={styles.manualTitle}>Enter a hex color (#RRGGBB)</Text>
              <TextInput
                style={styles.manualInput}
                value={manualColorInput}
                onChangeText={text => {
                  setManualColorInput(text);
                  if (manualErr) setManualErr('');
                }}
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="#ffffff"
              />
              {manualErr ? <Text style={styles.err}>{manualErr}</Text> : null}
              <View style={styles.manualButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.primaryButton]}
                  onPress={handleApplyManualColor}
                >
                  <Text style={styles.buttonText}>Apply</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.secondaryButton]}
                  onPress={() => setShowManual(false)}
                >
                  <Text style={[styles.buttonText, styles.secondaryText]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </Modal>


      {/* 🔻 Logo with standard gap */}
      <View style={{ alignItems: 'center', paddingBottom: insets.bottom + BOTTOM_GAP }}>
        <Logo />
      </View>
      
    </ScrollView>
  );
}

/* ------------------------------------------------------------------
 * Styles
 * ---------------------------------------------------------------- */
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLOR.canvas,
    paddingHorizontal: 16,
  },
  /* AI card */
  aiCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLOR.white,
    borderWidth: 2,
    borderColor: COLOR.primary,
    borderRadius: 10,
    padding: 14,
    marginTop: 12,
    marginBottom: 20,
  },
  aiIcon: { width: 60, height: 60, marginRight: 14 },
  aiTitle: { color: COLOR.primary, fontSize: 15, fontWeight: 'bold' },
  aiHint: { color: COLOR.primary, fontSize: 12, marginTop: 2 },
  chevron: { color: COLOR.primary, fontSize: 22, marginLeft: 6, fontWeight: 'bold' },

  /* Search */
  search: {
    alignSelf: 'center',
    width: '80%',
    maxWidth: 340,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: COLOR.white,
    shadowColor: '#3E575D',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
    marginBottom: 24,
    fontSize: 14,
  },

  /* Tile */
  tile: {
    backgroundColor: COLOR.white,
    borderRadius: 10,
    alignItems: 'center',
    padding: 12,
    elevation: 2,
  },
  icon: { width: 32, height: 32 },
  label: { textAlign: 'center', color: COLOR.primary, fontSize: 13 },

  overlayContainer: {
  flex: 1,
  backgroundColor: COLOR.canvas,
  justifyContent: 'space-between',
},

resultsContainer: {
  flexDirection: 'row',
  alignItems: 'flex-start',
  marginTop: 24,
  paddingVertical: 8,
  paddingHorizontal: 12,
  backgroundColor: COLOR.white,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: '#EFE7DC',
},
resultImage: {
  width: 100,
  aspectRatio: 1,
  borderRadius: 6,
  marginRight: 16,
},
resultInfo: {
  flex: 1,
  justifyContent: 'flex-start',
},
resultLabel: {
  fontSize: 14,
  fontWeight: '600',
  color: COLOR.primary,
  marginBottom: 6,
},
colorRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: 4,
},
colorSwatch: {
  width: 40,
  height: 40,
  borderRadius: 4,
  borderWidth: 1,
  borderColor: '#000',
  marginRight: 8,
},
colorName: {
  fontSize: 14,
  color: '#333',
},
ok: { color: 'green', marginVertical: 4 },
ko: { color: 'red', marginLeft: 6 },
  // base tappable button
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    marginHorizontal: 4,
    elevation: 2,           // Android shadow
    shadowColor: '#000',    // iOS shadow
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  // white outlined variant
  secondaryButton: {
    backgroundColor: COLOR.white,
    borderWidth: 2,
    borderColor: COLOR.primary,
  },
  // when you disable it
  disabled: {
    opacity: 0.6,
  },
  // default button text
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLOR.white,
  },
  // overrides text color on secondary buttons
  secondaryText: {
    color: COLOR.primary,
  },
primaryButton: {
  backgroundColor: COLOR.primary,
},
manualOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.5)',
  justifyContent: 'center',
  padding: 16,
},
manualCard: {
  backgroundColor: COLOR.white,
  borderRadius: 8,
  padding: 24,
},
manualTitle: {
  fontSize: 16,
  fontWeight: '600',
  marginBottom: 12,
  color: COLOR.primary,
},
manualInput: {
  borderWidth: 1,
  borderColor: '#CCC',
  borderRadius: 4,
  padding: 8,
  marginBottom: 12,
},
err: {
  color: '#D72638',
  fontSize: 13,
  marginBottom: 8,
},
manualButtons: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 12,
},

overlayClose: {
  position: 'absolute',
  left: 16,
  padding: 12,
  zIndex: 10,
},
middleContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  paddingHorizontal: 16,
},

});
