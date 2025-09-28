// src/screens/ServiceDetailsScreen.tsx
// HandOver ▸ Service detail page
// -----------------------------------------------------------------------------
import React, {useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Pressable,
  Modal,
  Image,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COLOR = {
  primary: '#3E575D',
  canvas: '#FAF9F6',
  white: '#FFFFFF',
};

export default function ServiceDetailsScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { id, name } = route.params as { id: string; name?: string };

  // Form state
  const [title, setTitle] = useState('');
  const [address, setAddress] = useState('');
  const [casa, setCasa] = useState('');
  const [casaList, setCasaList] = useState<string[]>([]);  // Store casas
  //const [modalVisible, setModalVisible] = useState(false);
  const [carBrand, setCarBrand] = useState('');
  const [carBrandList, setCarBrandList] = useState<string[]>([]);
  const [brandModalVisible, setBrandModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [carCategory, setCarCategory] = useState('');
  const [carCategoryList, setCarCategoryList] = useState<string[]>([]);
  const [fuelType, setFuelType] = useState('');
  const [fuelTypeList, setFuelTypeList] = useState<string[]>([]);
  const [fuelModalVisible, setFuelModalVisible] = useState(false);
  const [damagedParts, setDamagedParts] = useState<string[]>([]);
  const [resultImageUrl, setResultImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
// after
const [casaModalVisible, setCasaModalVisible] = useState(false);
const [imageModalVisible, setImageModalVisible] = useState(false);

  useEffect(() => {
      fetchCasas();
      fetchCarBrands();
      fetchCarCategories();
      fetchFuelTypes();
(async () => {
      await ImagePicker.requestCameraPermissionsAsync();
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    })();
    }, []);

      const fetchFuelTypes = async () => {
    try {
      const response = await axios.get('http://20.174.11.55/api/fuel-types');
      const names = response.data.map((type: any) => type.name);
      setFuelTypeList(names);
    } catch (error) {
      console.error('Error fetching fuel types:', error);
    }
  };
    const fetchCarCategories = async () => {
    try {
      const response = await axios.get('http://20.174.11.55/api/car-categories');
      const names = response.data.map((category: any) => category.name);
      setCarCategoryList(names);
    } catch (error) {
      console.error('Error fetching car categories:', error);
    }
  };

    const fetchCarBrands = async () => {
    try {
      const response = await axios.get('http://20.174.11.55/api/car-brands');
      const names = response.data.map((brand: any) => brand.name);
      setCarBrandList(names);
    } catch (error) {
      console.error('Error fetching car brands:', error);
    }
  };
      const fetchCasas = async () => {
    try {
      const response = await axios.get('http://20.174.11.55/api/casas');
      const names = response.data.map((casa: any) => casa.name);
      setCasaList(names);
    } catch (error) {
      console.error('Error fetching casas:', error);
    }
  };
  const submitTask = async () => {
  if (!title || !address || !casa || !carBrand || !carCategory || !fuelType) {
    alert('Please fill all fields');
    return;
  }

  try {
    const token = await AsyncStorage.getItem('@token'); // Or however you store your token
      const partsString = damagedParts.join(", ");

    const response = await fetch('http://20.174.11.55/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        service_id: 2,
        service_name: name,
        title: title,
        description: '', 
        location: address,
        casa: casa,
        car_brand: carBrand,
        car_category: carCategory,
        fuel_type: fuelType,
        damaged_parts: partsString
      })
    });

    const data = await response.json();

    if (response.ok) {
      alert('Task submitted successfully');
      navigation.goBack();
    } else {
      console.log(data);
      alert(data.message || 'Failed to submit');
    }
  } catch (error) {
    console.log(error);
    alert('An error occurred');
  }
};

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
  const openRequests = () => navigation.navigate('More', {
    screen: 'MyRequests',
    params: { serviceId: id, serviceName: name }
  });

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ padding: 16 }}>
      {/* Category (read-only) */}
      <Text style={styles.label}>Category</Text>
      <View style={styles.readOnlyField}>
        <Text style={styles.readOnlyText}>{name || '—'}</Text>
      </View>

      {/* Title input */}
      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        value={title}
        placeholder="Enter title"
        onChangeText={setTitle}
      />

      {/* Casa select */}
      <Text style={styles.label}>Casa</Text>
      <TouchableOpacity style={styles.select} onPress={() => setCasaModalVisible(true)}>
        <Text style={styles.selectText}>{casa || 'Select'}</Text>
        <Ionicons name="chevron-down-outline" size={20} color="blue" />
      </TouchableOpacity>

      {/* Modal to Show Casa Options */}
      <Modal
        visible={casaModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCasaModalVisible(false)}
      >
        <View style={{
          flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)'
        }}>
          <View style={{
            backgroundColor: 'white', padding: 20, borderRadius: 10, width: '80%'
          }}>
            <Text style={{ fontSize: 18, marginBottom: 10 }}>Select Casa</Text>
            <FlatList
              data={casaList}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    setCasa(item);
                    setCasaModalVisible(false);
                  }}
                  style={{ paddingVertical: 10 }}
                >
                  <Text>{item}</Text>
                </Pressable>
              )}
            />
            <Pressable onPress={() => setCasaModalVisible(false)} style={{ marginTop: 10 }}>
              <Text style={{ color: 'red', textAlign: 'center' }}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Address textarea */}
      <Text style={styles.label}>Address</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        multiline
        value={address}
        placeholder="Enter address"
        onChangeText={setAddress}
      />

      {/* Car Brand select */}
<Text style={styles.label}>Car Brand</Text>
      <TouchableOpacity style={styles.select} onPress={() => setBrandModalVisible(true)}>
        <Text style={styles.selectText}>{carBrand || 'Select'}</Text>
        <Ionicons name="chevron-down-outline" size={20} color="blue" />
      </TouchableOpacity>

      {/* Modal to Show Car Brand Options */}
      <Modal
        visible={brandModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setBrandModalVisible(false)}
      >
        <View style={{
          flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)'
        }}>
          <View style={{
            backgroundColor: 'white', padding: 20, borderRadius: 10, width: '80%'
          }}>
            <Text style={{ fontSize: 18, marginBottom: 10 }}>Select Car Brand</Text>
            <FlatList
              data={carBrandList}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    setCarBrand(item);
                    setBrandModalVisible(false);
                  }}
                  style={{ paddingVertical: 10 }}
                >
                  <Text>{item}</Text>
                </Pressable>
              )}
            />
            <Pressable onPress={() => setBrandModalVisible(false)} style={{ marginTop: 10 }}>
              <Text style={{ color: 'red', textAlign: 'center' }}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Car Category select */}
<Text style={styles.label}>Car Category</Text>
      <TouchableOpacity style={styles.select} onPress={() => setCategoryModalVisible(true)}>
        <Text style={styles.selectText}>{carCategory || 'Select'}</Text>
        <Ionicons name="chevron-down-outline" size={20} color="blue" />
      </TouchableOpacity>

      {/* Modal to Show Car Category Options */}
      <Modal
        visible={categoryModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <View style={{
          flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)'
        }}>
          <View style={{
            backgroundColor: 'white', padding: 20, borderRadius: 10, width: '80%'
          }}>
            <Text style={{ fontSize: 18, marginBottom: 10 }}>Select Car Category</Text>
            <FlatList
              data={carCategoryList}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    setCarCategory(item);
                    setCategoryModalVisible(false);
                  }}
                  style={{ paddingVertical: 10 }}
                >
                  <Text>{item}</Text>
                </Pressable>
              )}
            />
            <Pressable onPress={() => setCategoryModalVisible(false)} style={{ marginTop: 10 }}>
              <Text style={{ color: 'red', textAlign: 'center' }}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Fuel Type select */}
<Text style={styles.label}>Fuel Type</Text>
      <TouchableOpacity style={styles.select} onPress={() => setFuelModalVisible(true)}>
        <Text style={styles.selectText}>{fuelType || 'Select'}</Text>
        <Ionicons name="chevron-down-outline" size={20} color="blue" />
      </TouchableOpacity>

      {/* Modal to Show Fuel Type Options */}
      <Modal
        visible={fuelModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setFuelModalVisible(false)}
      >
        <View style={{
          flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)'
        }}>
          <View style={{
            backgroundColor: 'white', padding: 20, borderRadius: 10, width: '80%'
          }}>
            <Text style={{ fontSize: 18, marginBottom: 10 }}>Select Fuel Type</Text>
            <FlatList
              data={fuelTypeList}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    setFuelType(item);
                    setFuelModalVisible(false);
                  }}
                  style={{ paddingVertical: 10 }}
                >
                  <Text>{item}</Text>
                </Pressable>
              )}
            />
            <Pressable onPress={() => setFuelModalVisible(false)} style={{ marginTop: 10 }}>
              <Text style={{ color: 'red', textAlign: 'center' }}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      
      {(damagedParts.length > 0 || resultImageUrl) && (
  <View style={styles.resultsContainer}>
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
{/* Full-screen modal */}
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
    {damagedParts.length > 0 && (
      <View style={styles.resultInfo}>
        <Text style={styles.resultLabel}>Detected Damaged Parts:</Text>
        {damagedParts.map((part, idx) => (
          <Text key={idx} style={styles.resultValue}>• {part}</Text>
        ))}
      </View>
    )}
  </View>
)}

{/* Buttons */}
{/* ───────────── Buttons (Scan | Submit) ───────────── */}
<View style={styles.buttonRow}>
  {/* Scan */}
  <TouchableOpacity
    style={[
      styles.button,
      styles.secondaryButton,
      loading && styles.disabled,
    ]}
    onPress={openScan}
    disabled={loading}
    accessibilityRole="button"
    accessibilityLabel="Scan car image"
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
        <Text style={[styles.buttonText, styles.secondaryText]}>Scan</Text>
      </>
    )}
  </TouchableOpacity>

  {/* Submit */}
  <TouchableOpacity
    style={[styles.button, styles.primaryButton]}
    onPress={submitTask}
    accessibilityRole="button"
    accessibilityLabel="Submit task"
  >
    <Ionicons
      name="send"
      size={18}
      color={COLOR.white}
      style={{ marginRight: 6 }}
    />
    <Text style={styles.buttonText}>Submit</Text>
  </TouchableOpacity>
</View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLOR.canvas,
  },
  label: {
    fontSize: 14,
    color: COLOR.primary,
    marginBottom: 6,
    marginTop: 12,
    fontWeight: '600',
  },
  input: {
    backgroundColor: COLOR.white,
    borderColor: '#EFE7DC',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  select: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLOR.white,
    borderColor: '#EFE7DC',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  selectText: {
    fontSize: 14,
    color: '#333',
  },

 
  readOnlyField: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#f2f2f2',
  },
  readOnlyText: {
    color: '#555',
    fontSize: 16,
  },
  resultsContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    backgroundColor: COLOR.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EFE7DC',
    padding: 16,
    marginTop: 24,
  },
resultImage: {
  width: 120,
  height: 120,
  borderRadius: 6,
  marginRight: 16,
  shadowColor: '#000',
  shadowOpacity: 0.1,
  shadowOffset: { width: 0, height: 2 },
  shadowRadius: 4,
  elevation: 2,  // for Android
},
  resultInfo: {
    flex: 1,
    paddingLeft: 16,
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLOR.primary,
    marginBottom: 6,
  },
  resultValue: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  loadingContainer: {
    marginTop: 24,
    alignItems: 'center',
   },
  
    buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  button: {
    flex: 1,
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
  primaryButton: {
    backgroundColor: COLOR.primary,
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
    fontSize: 16,
    fontWeight: '600',
    color: COLOR.white,
  },
  secondaryText: {
    color: COLOR.primary,
  },
  modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.8)',
      justifyContent: 'center',
      alignItems: 'center',
    },
  fullscreenImage: {
    width: '90%',
    height: '80%',
  },
  previewBox: {
  width: 120,
  marginTop: 20,
  alignItems: 'center',
},
sectionTitle: {
  fontSize: 18,
  fontWeight: '600',
  marginBottom: 12,
},
});
