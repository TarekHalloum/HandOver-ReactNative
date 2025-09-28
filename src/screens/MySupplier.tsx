import React, { useState, useCallback ,useLayoutEffect} from 'react';
import axios from 'axios';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  useWindowDimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation, CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Logo from '../components/Logo';

// Colours
const COLOR = {
  primary: '#3E575D',
  accent: '#EFE7DC',
  canvas: '#FAF9F6',
  white: '#FFFFFF',
};

// Utility: safe aspect-ratio lookup (works on web + native)
function getAspectRatio(img: any, fallback: number): number {
  const resolver = Image?.resolveAssetSource;
  if (typeof resolver === 'function') {
    // @ts-ignore
    const { width: w, height: h } = resolver(img) ?? {};
    if (w && h) return w / h;
  }
  return fallback;
}

export default function MySupplierScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image
            source={require('../assets/donate.png')}
            style={{ width: 20, height: 20, marginRight: 6 }}
            resizeMode="contain"
          />
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: COLOR.primary }}>
            Donate Supplies
          </Text>
        </View>
      ),
    });
  }, [navigation]);
  // Assets & ratios
  const supplierImg = require('../assets/supplierp.png');
  const supplierRatio = getAspectRatio(supplierImg, 2.2);
  const BOTTOM_GAP = 24;

  // -- Hooks --
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [services, setServices] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [priceMode, setPriceMode] = useState(false);
  const [price, setPrice] = useState('');

  // Compute button states
  const canSetPrice = services.trim().length > 0;
  const canDonate = services.trim().length > 0 && (!priceMode || price.trim().length > 0);
// Send the advertisement. If `overridePrice` is supplied we use it;
const handleSubmit = async (overridePrice: number | null = null) => {
  try {
    const token = await AsyncStorage.getItem('@token');

    await axios.post(
      'http://20.174.11.55/api/advertisements',
      {
        services,
        quantity,
        // ‼️ choose the price to send
        price:
          overridePrice !== null
            ? overridePrice
            : priceMode
            ? parseFloat(price)
            : null,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      }
    );

    // Reset form
    setServices('');
    setQuantity(1);
    setPrice('');
    setPriceMode(false);

    alert('Advertisement submitted successfully!');
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error(err.response?.data || err.message);
      alert(
        'Failed to submit advertisement: ' +
          (err.response?.data?.message || err.message)
      );
    } else {
      console.error(err);
      alert('An unexpected error occurred.');
    }
  }
};

// Pressing Donate: force price = 0
const handleDonatePress = () => {
  handleSubmit(0); // treat it as a donation
};

// “Set Price” (first click) ➜ switches to price mode
// “Submit” (second click)  ➜ validates & sends
const handlePricePress = () => {
  if (!priceMode) {
    setPriceMode(true);
    return;
  }
  // already in price mode – validate first
  if (price.trim() === '' || isNaN(Number(price))) {
    alert('Please enter a valid numeric price.');
    return;
  }
  handleSubmit();
};

  // Refresh authentication status on screen focus
  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem('@token').then(token => {
        setIsAuthenticated(!!token);
      });
    }, [])
  );

  // If not authenticated, prompt to log in
  if (!isAuthenticated) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: 'center', alignItems: 'center', paddingTop: insets.top, paddingBottom: insets.bottom + BOTTOM_GAP }
        ]}
      >
        <Text style={styles.placeholderText}>Login to be a supplier</Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() =>
            navigation.dispatch(
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

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: COLOR.canvas }}
      contentContainerStyle={{ flexGrow: 1, paddingTop: insets.top }}
      showsVerticalScrollIndicator={false}
    >
      {/* Banner */}
      <View style={styles.bannerBox}>
        <Image
          source={supplierImg}
          style={{ width: width * 0.65, aspectRatio: supplierRatio }}
          resizeMode="contain"
        />
      </View>

      {/* Form Card */}
      <View style={styles.cardsBox}>
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Ionicons name="business-outline" size={20} color={COLOR.primary} />
            <Text style={styles.header}>Advertise with us</Text>
          </View>

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Service offered"
            multiline
            value={services}
            onChangeText={setServices}
          />

          {/* Quantity Stepper */}
          <View style={styles.quantityRow}>
            <Text style={styles.quantityLabel}>Quantity:</Text>
            <View style={styles.stepper}>
              <TouchableOpacity onPress={() => setQuantity(q => Math.max(1, q - 1))} style={styles.stepButton}>
                <Ionicons name="remove-circle-outline" size={24} color={COLOR.primary} />
              </TouchableOpacity>
              <Text style={styles.quantityValue}>{quantity}</Text>
              <TouchableOpacity onPress={() => setQuantity(q => q + 1)} style={styles.stepButton}>
                <Ionicons name="add-circle-outline" size={24} color={COLOR.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {priceMode && (
            <View style={styles.priceBox}>
              <Text style={styles.priceLabel}>Price:</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter price"
                keyboardType="numeric"
                value={price}
                onChangeText={txt => setPrice(txt.replace(/[^0-9.]/g, ''))}
              />
            </View>
          )}

        {/* Button row */}
        <View style={styles.buttonRow}>
          {/* Donate */}
          <TouchableOpacity
            style={[styles.button, styles.buttonHalf, services.trim() === '' && styles.buttonDisabled]}
            disabled={services.trim() === ''}
            onPress={handleDonatePress}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Donate</Text>
          </TouchableOpacity>

          {/* Set Price  →  Submit */}
          <TouchableOpacity
            style={[
              styles.button,
              styles.buttonHalf,
              // disable in submit phase if price is empty/invalid
              priceMode && (price.trim() === '' || isNaN(Number(price))) && styles.buttonDisabled,
              // disable in set-price phase if no service selected
              !priceMode && services.trim() === '' && styles.buttonDisabled,
            ]}
            disabled={
              priceMode
                ? price.trim() === '' || isNaN(Number(price))
                : services.trim() === ''
            }
            onPress={handlePricePress}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>{priceMode ? 'Submit' : 'Set Price'}</Text>
          </TouchableOpacity>
        </View>

          {/* Placeholder text when no services are entered */}
          {services.trim() === '' && (
            <Text style={styles.placeholderText}>
              Enter the service you want to advertise
            </Text>
          )}


        </View>
      </View>    
        {/* Logo pinned to bottom */}
          <View style={{ alignItems: 'center', paddingBottom: insets.bottom + BOTTOM_GAP }}>
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
  bannerBox: {
    alignItems: 'center',

    
  },
  cardsBox: {
    width: '90%',
    maxWidth: 600,
    flexGrow: 1,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  card: {
    backgroundColor: COLOR.white,
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: COLOR.primary,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  header: {
    fontSize: 20,
    fontWeight: '600',
    color: COLOR.primary,
    marginLeft: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: COLOR.primary,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 14,
    backgroundColor: COLOR.white,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  quantityLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLOR.primary,
    marginRight: 8,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepButton: {
    paddingHorizontal: 8,
  },
  quantityValue: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 4,
  },
  priceBox: {
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLOR.primary,
    marginBottom: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  buttonHalf: {
    flex: 1,
    marginHorizontal: 4,
  },
  button: {
    backgroundColor: COLOR.primary,
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: COLOR.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
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