// src/screens/ScanScreen.tsx
// HandOver ▸ Scan
// Palette: #3E575D • #EFE7DC • #FAF9F6 • #FFFFFF
// -----------------------------------------------------------------------------
// 2025-07-01 – centred two-card layout (above & below screen centre)

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  useWindowDimensions,
  ActivityIndicator,
  Platform,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Logo from '../components/Logo';
import AsyncStorage from '@react-native-async-storage/async-storage';
/* ─── Colours ──────────────────────────────────────────────────────────────── */
const COLOR = {
  primary: '#3E575D',
  canvas : '#FAF9F6',
  white  : '#FFFFFF',
};

/* ──────────────────────────────────────────────────────────────────────────── */
export default function ScanScreen() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const insets       = useSafeAreaInsets();
  const nav          = useNavigation<any>();
  const { width }    = useWindowDimensions();
  const [showOverlay, setShowOverlay] = useState(false);
  const [loadingScan, setLoadingScan] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [scannedColor, setScannedColor] = useState<string | null>(null);
  const [isMatch, setIsMatch] = useState<boolean | null>(null);
  const [showManual, setShowManual] = useState(false);
  const [manualColorInput, setManualColorInput] = useState('');
  const [manualErr, setManualErr] = useState('');
  const [closestName, setClosestName] = useState<string | null>(null);
  const [resultImageUrl,    setResultImageUrl]    = useState<string | null>(null);
  const [damagedParts,      setDamagedParts]      = useState<string[]>([]);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [carBrand, setCarBrand] = useState('');
  const [showVehicleOverlay, setShowVehicleOverlay] = useState(false);

  const openScan = async () => {
      // First try library
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });
  
      // If user cancelled or didn't grant library perms, fall back to camera
      if (result.canceled || !result.assets?.length) {
        // try camera instead
        const camPerm = await ImagePicker.getCameraPermissionsAsync();
        if (camPerm.status !== 'granted') {
          return Alert.alert(
            'Permission needed',
            'We need camera or media-library permission to scan the accident photo.',
            [{ text: 'OK' }]
          );
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.8,
        });
        if (result.canceled || !result.assets?.length) {
          return Alert.alert('No image', 'No image was selected.');
        }
      }
  
      const uri = result.assets[0].uri;
      setResultImageUrl(uri);
      setLoading(true);
  
      // Prepare upload
      let uploadUri = uri;
      if (Platform.OS === 'android' && !uploadUri.startsWith('file://')) {
        uploadUri = 'file://' + uploadUri;
      }
  
      // Convert to blob (ensures real image mime)
      const resp = await fetch(uploadUri);
      const blob = await resp.blob();
  
      const formData = new FormData();
      formData.append('image', blob, 'accident.jpg');
  
      try {
        const response = await fetch('http://20.174.11.55:8000/scan', {
          method: 'POST',
          headers: {
            // don’t set Content-Type — let fetch add boundary
            Accept: 'application/json',
          },
          body: formData,
        });
        const data = await response.json();
  
        if (!response.ok) {
          console.warn('Scan API error payload:', data);
          return Alert.alert('Scan failed', data.message || 'Server error');
        }
  
        // Success!
        if (data.brand) {
          setCarBrand(data.brand); 
        }      
        setDamagedParts(data.damaged_parts || []);
        setResultImageUrl(
          data.result_url.replace('localhost', '20.174.11.55')
        );
        // if you want to display the processed image
        // setImageUri(data.result_url.replace('localhost','20.174.11.55'));
        Alert.alert('Scan complete');
      } catch (err) {
        console.error('Scan failed:', err);
        Alert.alert('Error', 'An error occurred during scanning.');
      } finally {
        setLoading(false);
      }
    };
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
  /* Pick / capture photo ---------------------------------------------------- */
  const choosePhoto = async () => {
    let res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality   : 0.8,
    });

    /* If user cancelled – fallback to camera or warn ----------------------- */
    if (res.canceled || !res.assets?.length) {
      const perm = await ImagePicker.getCameraPermissionsAsync();
      if (perm.status !== 'granted') {
        return Alert.alert(
          'Permission needed',
          'We need camera or media-library permission to select a photo.',
        );
      }
      res = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality   : 0.8,
      });
      if (res.canceled || !res.assets?.length) {
        return Alert.alert('No image', 'No image was selected.');
      }
    }
    setSelectedImage(res.assets[0].uri);
    // TODO: upload / preview
  };

  /* ──────────────── Render ──────────────────────────────────────────────── */
  return (
    <View style={styles.root}>
      {/* 1️⃣ Top header (safe-area aware) */}
      <View style={{ paddingTop: insets.top }}>
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => nav.goBack()} style={{ padding: 8 }}>
            <Ionicons name="arrow-back" size={24} color={COLOR.primary} />
          </TouchableOpacity>
          <View style={styles.headerTitle}>
            <Ionicons name="camera-outline" size={20} color={COLOR.primary} />
            <Text style={styles.headerText}>Scan</Text>
          </View>
        </View>
      </View>

      {/* 2️⃣ Scrollable body */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow      : 1,
          paddingTop    : 24,
          paddingBottom : insets.bottom + 24, // logo gap
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero illustration */}
        <Image
          source={require('../assets/scanp.png')}
          style={{
            width  : width * 0.6,
            height : width * 0.6,
            alignSelf: 'center',
            marginBottom:-48,
            marginTop:  -48,
          }}
          resizeMode="contain"
        />

        {/* 3️⃣ Detection cards – centred stack */}
        <View style={[styles.cardsBox, { marginTop: -64 }]}>
          {/* (a) AI Color Detection – slightly above centre */}
          <TouchableOpacity
            style={[styles.card, { marginBottom: 18 }]}
            activeOpacity={0.9}
            onPress={() => setShowOverlay(true)}
          >
            <Image
              source={require('../assets/colorScan.png')}
              style={styles.cardIcon}
              resizeMode="contain"
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>AI Color Detection</Text>
              <Text style={styles.cardHint}>
                To detect the color of a wall, floor … kindly press here
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          {/* (b) Vehicle Detection – slightly below centre */}
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.9}
            onPress={() => setShowVehicleOverlay(true)}
          >
            <Image
              source={require('../assets/scan.png')}
              style={styles.cardIcon}
              resizeMode="contain"
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Vehicle Detection</Text>
              <Text style={styles.cardHint}>
                Our AI detects the logo and the damaged parts
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

        </View>

        {/* 4️⃣ Footer logo */}
        <View style={{ alignItems: 'center' }}>
          <Logo />
        </View>
      </ScrollView>

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

                    <Modal
                      visible={showVehicleOverlay}
                      animationType="slide"
                      transparent={false}
                      onRequestClose={() => setShowVehicleOverlay(false)}
                    >
                      <View style={styles.overlayContainer}>
                        {/* ← Back arrow */}
                        <TouchableOpacity
                          onPress={() => setShowVehicleOverlay(false)}
                          style={[styles.overlayClose, { top: insets.top + 24 }]}
                        >
                          <Ionicons name="arrow-back" size={24} color={COLOR.primary} />
                        </TouchableOpacity>
            
                        {/* ← Header image */}
                        <View style={{ alignItems: 'center', marginTop: insets.top + 24 }}>
                          <Image
                            source={require('../assets/scanp.png')}
                            style={{ width: 200, height: 200 }}
                            resizeMode="contain"
                          />
                        </View>
            
                        <View style={styles.middleContainer}>
                          <View style={{ padding: 16 }}>
                            {/* ← Scan button */}
                            <TouchableOpacity
                              style={[
                                styles.button,
                                styles.secondaryButton,
                                { width: width * 0.6, alignSelf: 'center' },
                                loading && styles.disabled,
                              ]}
                              onPress={openScan}
                              disabled={loading}
                              accessibilityRole="button"
                            >
                              {loading ? (
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
            
                            {/* ← AI results */}
                            {(resultImageUrl || damagedParts.length > 0) && (
                              <View style={styles.resultsContainer}>
                                {/* Processed Image */}
                                {resultImageUrl && (
                                  <View style={styles.previewBox}>
                                    <Text style={styles.sectionTitle}>Processed Image</Text>
                                    <TouchableOpacity onPress={() => setImageModalVisible(true)}>
                                      <Image
                                        source={{ uri: resultImageUrl }}
                                        style={styles.resultImage}
                                        resizeMode="contain"
                                      />
                                    </TouchableOpacity>
                                  </View>
                                )}
            
                                {/* Full-screen preview */}
                                <Modal
                                  visible={imageModalVisible}
                                  transparent
                                  animationType="fade"
                                  onRequestClose={() => setImageModalVisible(false)}
                                >
                                  <TouchableOpacity
                                    style={styles.modalOverlay}
                                    activeOpacity={1}
                                    onPress={() => setImageModalVisible(false)}
                                  >
                                    <Image
                                      source={{ uri: resultImageUrl! }}
                                      style={styles.fullscreenImage}
                                      resizeMode="contain"
                                    />
                                  </TouchableOpacity>
                                </Modal>
            
                                {/* Detected Parts */}
                                {damagedParts.length > 0 && (
                                  <View style={styles.resultInfo}>
                                    <Text style={styles.resultLabel}>Detected Damaged Parts:</Text>
                                    {damagedParts.map((part, idx) => (
                                      <Text key={idx} style={styles.resultValue}>
                                        • {part}
                                      </Text>
                                    ))}
                                  </View>
                                )}
                              </View>
                            )}
                          </View>
                        </View>
            
                        {/* ← Footer logo */}
                        <View style={{ alignItems: 'center', marginBottom: insets.bottom + 24 }}>
                          <Logo />
                        </View>
                      </View>
                    </Modal>
            
    </View>
  );
}

/* ─── Styles ──────────────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLOR.canvas,
  },

  /* Header */
  headerBar: {
    flexDirection     : 'row',
    alignItems        : 'center',
    backgroundColor   : COLOR.white,
    paddingHorizontal : 16,
    paddingVertical   : 8,
    borderBottomWidth : 1,
    borderBottomColor : '#E0E0E0',
  },
  headerTitle: {
    flexDirection : 'row',
    alignItems    : 'center',
    marginLeft    : 12,
  },
resultValue: {
  fontSize: 14,
  color: COLOR.primary,
  marginBottom: 4,
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
fullscreenImage: {
  width: '90%',
  height: '90%',
},
modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.8)',
  justifyContent: 'center',
  alignItems: 'center',
},
  headerText: {
    color      : COLOR.primary,
    fontSize   : 16,
    fontWeight : '600',
    marginLeft : 8,
  },

  /* Centred cards wrapper (copies ServicesScreen technique) */
  cardsBox: {
    width       : '90%',
    maxWidth    : 600,
    alignSelf   : 'center',
    flexGrow    : 1,
    justifyContent: 'center',   // centres the two-card stack
  },
 
  /* Individual card */
  card: {
    flexDirection : 'row',
    alignItems    : 'center',
    backgroundColor: COLOR.white,
    borderRadius  : 10,
    padding       : 14,
    marginVertical: 2,
    borderWidth   : 2,
    borderColor   : COLOR.primary,
  },
sectionTitle: {
  fontSize: 16,
  fontWeight: '600',
  color: COLOR.primary,
  marginBottom: 8,
},
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
  cardIcon: { width: 60, height: 60, marginRight: 14 },
  cardTitle: { color: COLOR.primary, fontSize: 15, fontWeight: 'bold' },
  cardHint : { color: '#1F2D3D', fontSize: 12, marginTop: 2 },
  chevron  : { color: COLOR.primary, fontSize: 22, marginLeft: 6, fontWeight: 'bold' },
  overlayContainer: {
  flex: 1,
  backgroundColor: '#FAF9F6',
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
previewBox: {
  marginBottom: 24,
  marginRight: 16, 
  alignItems: 'center',
},

});
