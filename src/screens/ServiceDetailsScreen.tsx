// src/screens/ServiceDetailsScreen.tsx
// HandOver ▸ Service detail page
// -----------------------------------------------------------------------------
import React, {useEffect, useState } from 'react';
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
  ActivityIndicator,
  Alert,
  Button
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

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
  const [modalVisible, setModalVisible] = useState(false);
  const [homecateg, sethomecateg] = useState('');
  const [homecat, sethomecat] = useState<string[]>([]);
  const [homecategory, sethomecategory] = useState(false);
  const [propertyconditionVisible, setpropertyconditionVisible] = useState(false);
  const [propertycondition, setpropertycondition] = useState('');
  const [propertyconditionList, setpropertyconditionList] = useState<string[]>([]);
  const [buildingmats, setbuildingmats] = useState('');
  const [BuildingMatsList, setBuildingMatsList] = useState<string[]>([]);
  const [BuildingMatsVisible, setBuildingMatsVisible] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [scannedColor, setScannedColor] = useState<string | null>(null);
  const [closestName, setClosestName] = useState<string | null>(null);
  const [loadingScan, setLoadingScan] = useState(false);
  const [isMatch, setIsMatch] = useState<boolean | null>(null);
 const [manualColorInput, setManualColorInput] = useState<string>(''); // current text in the input
const [showManual, setShowManual]         = useState(false);    
  const [manualErr, setManualErr] = useState<string>('');

  useEffect(() => {
      fetchCasas();
      fetchhomecategs();
      fetchCarCategories();
      fetchbuildingmatss();
(async () => {
     const { status } = await ImagePicker.requestCameraPermissionsAsync();
     if (status !== 'granted') {
        alert('Camera permission is required to scan color');
     }
   })();
    }, []);

      const fetchbuildingmatss = async () => {
    try {
      const response = await axios.get('http://20.174.11.55/api/building-materials');
      const names = response.data.map((type: any) => type.name);
      setBuildingMatsList(names);
    } catch (error) {
      console.error('Error fetching fuel types:', error);
    }
  };
    const fetchCarCategories = async () => {
    try {
      const response = await axios.get('http://20.174.11.55/api/property-conditions');
      const names = response.data.map((category: any) => category.name);
      setpropertyconditionList(names);
    } catch (error) {
      console.error('Error fetching car categories:', error);
    }
  };

    const fetchhomecategs = async () => {
    try {
      const response = await axios.get('http://20.174.11.55/api/home-categories');
      const names = response.data.map((brand: any) => brand.name);
      sethomecat(names);
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

const handleScan = async () => {
  try {
    // 1) Take photo
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (result.canceled) return;

    // 2) Normalize URI on Android
    let uri = result.assets[0].uri;
    if (Platform.OS === 'android' && !uri.startsWith('file://')) {
      uri = 'file://' + uri;
    }
    setImageUri(uri);
    setLoadingScan(true);
    setScannedColor(null);

    // 3) Load the image into a real Blob
    const resp = await fetch(uri);
    const blob = await resp.blob();

    // 4) Build FormData with that Blob
    const formData = new FormData();
    formData.append('image', blob, 'photo.jpg');

    // 5) Send via fetch so the browser sets the multipart boundary correctly
    const token = await AsyncStorage.getItem('@token');
    const apiResp = await fetch('http://20.174.11.55/api/detect-color', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // NOTE: Do *not* set Content-Type here!
      },
      body: formData,
    });

    const data = await apiResp.json();
    if (!apiResp.ok) {
      console.warn('🛑 Server validation errors:', data);
      throw new Error(data.message || 'Server rejected image');
    }

    // 6) Success: update your state
    setScannedColor(data.hex_detected.toLowerCase());
    setClosestName(data.closest_name);
    setIsMatch(data.match); 
  } catch (err: any) {
    console.error('Scan failed:', err);
    alert(err.message || 'Error scanning color');
  } finally {
    setLoadingScan(false);
  }
};

  const submitTask = async () => {
  if (!title || !address || !casa || !homecateg || !propertycondition || !buildingmats) {
    alert('Please fill all fields');
    return;
  }

  try {
    const token = await AsyncStorage.getItem('@token'); // Or however you store your token

    const response = await fetch('http://20.174.11.55/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        service_id: 1,
        service_name: name,
        title: title,
        description: '', 
        location: address,
        casa: casa,
        car_brand: homecateg,
        car_category: propertycondition,
        fuel_type: buildingmats,
        color: closestName
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
const handleApplyManualColor = () => {
  const input = manualColorInput.trim();

  // 1) No empty field
  if (!input) {
    setManualErr('Please enter a color.');
    return;
  }

  // 2) Must begin with exactly one '#'
  const hashes = (input.match(/#/g) || []).length;
  if (hashes !== 1 || input[0] !== '#') {
    setManualErr('Color must begin with exactly one "#" character.');
    return;
  }

  // strip off the '#'
  const hex = input.slice(1);

  // 3) Must be exactly 6 characters long
  if (hex.length < 6) {
    setManualErr('Hex code is too short. It needs 6 characters after "#".');
    return;
  }
  if (hex.length > 6) {
    setManualErr('Hex code is too long. Only 6 characters allowed after "#".');
    return;
  }

  // 4) Only allow 0–9, A–F
  if (!/^[0-9A-Fa-f]{6}$/.test(hex)) {
    setManualErr('Use only hexadecimal digits (0–9, A–F) after "#".');
    return;
  }

  // If all checks pass, apply the color
  const cleaned = `#${hex.toLowerCase()}`;
  setScannedColor(cleaned);
  setClosestName(cleaned);
  setShowManual(false);
  setManualColorInput('');
  setManualErr('');
};


  // Handlers
  const openScan = () => navigation.navigate('Scan');
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
      <TouchableOpacity style={styles.select} onPress={() => setModalVisible(true)}>
        <Text style={styles.selectText}>{casa || 'Select'}</Text>
        <Ionicons name="chevron-down-outline" size={20} color="blue" />
      </TouchableOpacity>

      {/* Modal to Show Casa Options */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
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
                    setModalVisible(false);
                  }}
                  style={{ paddingVertical: 10 }}
                >
                  <Text>{item}</Text>
                </Pressable>
              )}
            />
            <Pressable onPress={() => setModalVisible(false)} style={{ marginTop: 10 }}>
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
<Text style={styles.label}>Home Category</Text>
      <TouchableOpacity style={styles.select} onPress={() => sethomecategory(true)}>
        <Text style={styles.selectText}>{homecateg || 'Select'}</Text>
        <Ionicons name="chevron-down-outline" size={20} color="blue" />
      </TouchableOpacity>

      {/* Modal to Show Car Brand Options */}
      <Modal
        visible={homecategory}
        animationType="slide"
        transparent={true}
        onRequestClose={() => sethomecategory(false)}
      >
        <View style={{
          flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)'
        }}>
          <View style={{
            backgroundColor: 'white', padding: 20, borderRadius: 10, width: '80%'
          }}>
            <Text style={{ fontSize: 18, marginBottom: 10 }}>Home Category</Text>
            <FlatList
              data={homecat}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    sethomecateg(item);
                    sethomecategory(false);
                  }}
                  style={{ paddingVertical: 10 }}
                >
                  <Text>{item}</Text>
                </Pressable>
              )}
            />
            <Pressable onPress={() => sethomecategory(false)} style={{ marginTop: 10 }}>
              <Text style={{ color: 'red', textAlign: 'center' }}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Car Category select */}
<Text style={styles.label}>Property Condition</Text>
      <TouchableOpacity style={styles.select} onPress={() => setpropertyconditionVisible(true)}>
        <Text style={styles.selectText}>{propertycondition || 'Select'}</Text>
        <Ionicons name="chevron-down-outline" size={20} color="blue" />
      </TouchableOpacity>

      {/* Modal to Show Car Category Options */}
      <Modal
        visible={propertyconditionVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setpropertyconditionVisible(false)}
      >
        <View style={{
          flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)'
        }}>
          <View style={{
            backgroundColor: 'white', padding: 20, borderRadius: 10, width: '80%'
          }}>
            <Text style={{ fontSize: 18, marginBottom: 10 }}>Property Condion</Text>
            <FlatList
              data={propertyconditionList}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    setpropertycondition(item);
                    setpropertyconditionVisible(false);
                  }}
                  style={{ paddingVertical: 10 }}
                >
                  <Text>{item}</Text>
                </Pressable>
              )}
            />
            <Pressable onPress={() => setpropertyconditionVisible(false)} style={{ marginTop: 10 }}>
              <Text style={{ color: 'red', textAlign: 'center' }}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Fuel Type select */}
<Text style={styles.label}>Building Materials</Text>
      <TouchableOpacity style={styles.select} onPress={() => setBuildingMatsVisible(true)}>
        <Text style={styles.selectText}>{buildingmats || 'Select'}</Text>
        <Ionicons name="chevron-down-outline" size={20} color="blue" />
      </TouchableOpacity>

      {/* Modal to Show Fuel Type Options */}
      <Modal
        visible={BuildingMatsVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setBuildingMatsVisible(false)}
      >
        <View style={{
          flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)'
        }}>
          <View style={{
            backgroundColor: 'white', padding: 20, borderRadius: 10, width: '80%'
          }}>
            <Text style={{ fontSize: 18, marginBottom: 10 }}>Building Material</Text>
            <FlatList
              data={BuildingMatsList}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    setbuildingmats(item);
                    setBuildingMatsVisible(false);
                  }}
                  style={{ paddingVertical: 10 }}
                >
                  <Text>{item}</Text>
                </Pressable>
              )}
            />
            <Pressable onPress={() => setBuildingMatsVisible(false)} style={{ marginTop: 10 }}>
              <Text style={{ color: 'red', textAlign: 'center' }}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      
      {/* Scan results */}
      {(imageUri || scannedColor) && (
        <View style={styles.resultsContainer}>

          {/* ---- Photo preview ---- */}
          {imageUri && (
            <Image source={{ uri: imageUri }} style={styles.resultImage} />
          )}

          {/* ---- Color information ---- */}
          <View style={styles.resultInfo}>
            {scannedColor && (
              <>
                <Text style={styles.resultLabel}>Detected Color</Text>

                {/* single row: swatch + name + “Not 100%” */}
                <View style={styles.colorRow}>
                  <View
                    style={[
                      styles.colorSwatch,
                      {
                        backgroundColor: scannedColor,
                        marginRight: 8,
                      },
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


            {/* Only show “Match confirmed” if it passed */}
            {isMatch !== null && isMatch && (
              <Text style={styles.ok}>Match confirmed</Text>
            )}
          </View>


          {/* ---- Manual entry button in right column ---- */}
          {isMatch !== null && !isMatch && (
            <View style={styles.manualButtonContainer}>
              <TouchableOpacity
                style={[styles.smallButton, styles.primaryButton]}
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
            </View>
          )}

        </View>
      )}

{/* ---- Manual-entry modal ---- */}
<Modal
  visible={showManual}
  animationType="slide"
  transparent
>
  <View style={styles.manualOverlay}>
    <View style={styles.manualCard}>
      <Text style={styles.manualTitle}>
        Enter a hex color (#RRGGBB)
      </Text>

       {/* 1️⃣ Your TextInput */}
      <TextInput
        style={styles.manualInput}
        value={manualColorInput}
        onChangeText={text => {
          setManualColorInput(text);
          if (manualErr) setManualErr('');
        }}
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="Enter it like this format #ffffff"
      />

      {/* 2️⃣ Right here: render the inline error */}
      {manualErr ? (
        <Text style={styles.err}>{manualErr}</Text>
      ) : null}

      {/* 3️⃣ Then your buttons */}
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


     
{/* Buttons */}
      {/* ───────── Buttons (Scan | Submit) ───────── */}
<View style={styles.buttonRow}>
  {/* Scan (only for Painting Service, id '5') */}
  {id === '5' && (
    <TouchableOpacity
      style={[
        styles.button,
        styles.secondaryButton,
        loadingScan && styles.disabled,
      ]}
      onPress={handleScan}
      disabled={loadingScan}
      accessibilityRole="button"
      accessibilityLabel="Scan color image"
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
  )}

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

  secondaryButton: {
    backgroundColor: COLOR.white,
    borderWidth: 2,
    borderColor: COLOR.primary,
  },


 disabled: {
  opacity: 0.6,
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
    aspectRatio: 1, // keep square but let height flow
    borderRadius: 6,
    marginRight: 16,
  },
  resultInfo: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  smallButton: {
  alignSelf: 'flex-start',   // keeps it left-aligned
  paddingVertical: 8,        // slimmer height
  paddingHorizontal: 12,
  borderRadius: 8,
  flexDirection: 'row',
  alignItems: 'center',
  minWidth: 120,
},
  resultLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLOR.primary,
    marginBottom: 6,
  },
colorSwatch: {
  width: 40,
  height: 40,
  borderRadius: 4,
  borderWidth: 1,
  borderColor: '#000',

},
  colorName: {
    fontSize: 14,
    color: '#333',
    flexShrink: 0,
  },
ok:              { color: 'green', marginVertical: 4 },
ko: {
  color: 'red',
  marginLeft: 6,    // space to the left, not vertical
  flexShrink: 0,    // prevent it from collapsing/wrapping
},
manualContainer: { flex: 1, padding: 24, justifyContent: 'center' },

  // dimmed full-screen overlay
  manualOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  // white card container
  manualCard: {
    backgroundColor: COLOR.white,
    borderRadius: 8,
    padding: 24,
  },
  // modal title text
  manualTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: COLOR.primary,
  },
  // hex-input field
  manualInput: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 4,
    padding: 8,
    marginBottom: 16,
  },
  // row of buttons
  manualButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  // primary (blue) button
  primaryButton: {
    backgroundColor: COLOR.primary,
    marginRight: 8,
  },
 
  // button text
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLOR.white,
  },
  // override text color for secondary buttons
  secondaryText: {
    color: COLOR.primary,
  },
err: {
  color: '#D72638',    // same red you use elsewhere
  fontSize: 13,
  marginBottom: 8,
},
manualButton: {
  paddingVertical: 8,      // smaller height
  paddingHorizontal: 12,   // slimmer width
  alignSelf: 'flex-start', // hug the content above
  marginTop: 8,            // lift it closer to “Not 100%”
},
manualButtonContainer: {
  // no more flex:1—let it size to its content
  alignItems: 'center',
  justifyContent: 'flex-end',  // push it to the bottom
  paddingLeft: 12,             // keep space from middle column
  marginBottom: 4,             // same gap you have under "Not 100%"
},

colorRow: {
  flexDirection: 'row',
  alignItems: 'center',
  flexWrap: 'nowrap', 
  marginTop: 4,   // small gap under the swatch
},

});
