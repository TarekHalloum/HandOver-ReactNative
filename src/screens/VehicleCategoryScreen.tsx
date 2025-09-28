// src/screens/VehicleCategoryScreen.tsx
// HandOver ▸ Vehicle-services catalogue (consistent footer gap)
// Palette: #3E575D • #EFE7DC • #FAF9F6 • #FFFFFF
// -----------------------------------------------------------------------------
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
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Logo from '../components/Logo';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
/* ------------------------------------------------------------------
 * Constants
 * ---------------------------------------------------------------- */
const COLOR = {
  primary: '#3E575D',
  canvas: '#FAF9F6',
  white: '#FFFFFF',
};
const BOTTOM_GAP = 24; // uniform logo-footer spacing across the app
const ICON_VEHICLE = require('../assets/vehicle2.png')
interface Service {
  id: string;
  name: string;
  icon : any; // using local icon for consistency
}
interface ApiService {
  id: number;
  service_name: string;
}

/* ------------------------------------------------------------------
 * Component
 * ---------------------------------------------------------------- */
export default function VehicleCategoryScreen() {
  const nav = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [error, setError] = useState<string | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [data, setData]   = useState<Service[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingScan,       setLoadingScan]       = useState(false);
  const [resultImageUrl,    setResultImageUrl]    = useState<string | null>(null);
  const [damagedParts,      setDamagedParts]      = useState<string[]>([]);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [carBrand, setCarBrand] = useState('');
  const [carBrandList, setCarBrandList] = useState<string[]>([]);
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
  /* ─ Fetch services once ─ */
  useEffect(() => {
    const abort = new AbortController();

    fetch('http://20.174.11.55/api/services/vehicle', {
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
          icon: ICON_VEHICLE,
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
      onPress={() => nav.navigate('ServiceDetails2', { id: item.id, name: item.name })}
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
    >
      <TouchableOpacity
        style={styles.aiCard}
        activeOpacity={0.9}
        onPress={() => setShowOverlay(true)}

      >
        <Image source={require('../assets/scan.png')} style={styles.aiIcon} resizeMode="contain" />
        <View style={{ flex: 1 }}>
          <Text style={styles.aiTitle}>Vehicle Detection</Text>
          <Text style={styles.aiHint}>Our AI detect the logo and the dammaged parts</Text>
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
            {/* ← Back arrow */}
            <TouchableOpacity
              onPress={() => setShowOverlay(false)}
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
    backgroundColor: COLOR.white,  // gives you a clean white “page”
  },
  overlayClose: {
    padding: 16,                   // gives the arrow some tappable area
  },




/* ------------------------------------------------------------------
 * Scan Modal & Results styles
 * ---------------------------------------------------------------- */
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
secondaryButton: {
  backgroundColor: COLOR.white,
  borderWidth: 2,
  borderColor: COLOR.primary,
},
disabled: {
  opacity: 0.6,
},
buttonText: {
  fontSize: 14,
  fontWeight: '600',
  color: COLOR.white,
},
secondaryText: {
  color: COLOR.primary,
},
middleContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  paddingHorizontal: 16,
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
previewBox: {
  marginBottom: 24,
  marginRight: 16, 
  alignItems: 'center',
},
sectionTitle: {
  fontSize: 16,
  fontWeight: '600',
  color: COLOR.primary,
  marginBottom: 8,
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
resultValue: {
  fontSize: 14,
  color: COLOR.primary,
  marginBottom: 4,
},
modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.8)',
  justifyContent: 'center',
  alignItems: 'center',
},
fullscreenImage: {
  width: '90%',
  height: '90%',
},

});