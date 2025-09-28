// src/screens/EmergencyReceiveScreen.tsx
// HandOver ▸ Emergency Aid – Receive Aid (available list + protected request flow)
// Palette: #3E575D • #EFE7DC • #FAF9F6 • #FFFFFF
// -----------------------------------------------------------------------------
import React, { useState,useEffect, useLayoutEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Logo from '../components/Logo';
import AsyncStorage from '@react-native-async-storage/async-storage';

/* ------------------------------------------------------------------
 * Colours
 * ---------------------------------------------------------------- */
const COLOR = {
  primary: '#3E575D',
  primaryDim: '#A0A0A0',
  canvas: '#FAF9F6',
  white: '#FFFFFF',
  textLight: '#A0A0A0',
  error: '#C62828',
};

/* ------------------------------------------------------------------
 * Types & dummy data (replace with API in production)
 * ---------------------------------------------------------------- */
export interface AidItem {
  id: string;
  item: string;
  quantity: number;
  donor: string;
}

const initialData: AidItem[] = [
  { id: '1', item: 'Water Bottles', quantity: 50, donor: 'Community Center' },
  { id: '2', item: 'Blankets', quantity: 20, donor: 'Local Shelter' },
  { id: '3', item: 'Canned Food', quantity: 100, donor: 'Food Bank' },
];

/* ------------------------------------------------------------------
 * Single aid card component
 * ---------------------------------------------------------------- */
interface AidCardProps {
  item: AidItem;
  onAccept: (id: string, qty: number) => void;
}

function AidCard({ item, onAccept }: AidCardProps) {
  const [qty, setQty] = useState(1);

  const incDisabled = qty >= item.quantity;
  const decDisabled = qty <= 1;

  const inc = () => !incDisabled && setQty(q => q + 1);
  const dec = () => !decDisabled && setQty(q => q - 1);

  const handleAccept = () => {
    onAccept(item.id, qty);
    setQty(1); // reset after acceptance
  };

  return (
    <View style={styles.card}>
      {/* Item name */}
      <Text style={styles.itemName}>{item.item}</Text>

      {/* Quantity controls */}
      <View style={styles.qtyControlsRow}>
        <TouchableOpacity
          onPress={dec}
          disabled={decDisabled}
          style={[styles.arrowBtn, decDisabled && styles.arrowBtnDisabled]}
        >
          <Ionicons
            name="chevron-down"
            size={16}
            color={decDisabled ? COLOR.textLight : COLOR.primary}
          />
        </TouchableOpacity>

        <Text style={styles.qtyValue}>{qty}</Text>

        <TouchableOpacity
          onPress={inc}
          disabled={incDisabled}
          style={[styles.arrowBtn, incDisabled && styles.arrowBtnDisabled]}
        >
          <Ionicons
            name="chevron-up"
            size={16}
            color={incDisabled ? COLOR.textLight : COLOR.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Availability & donor + Accept button aligned horizontally */}
      <View style={styles.bottomRow}>
        <Text style={styles.availTxt}>
          {item.quantity} available • Donor: {item.donor}
        </Text>

        <TouchableOpacity
          style={styles.acceptBtn}
          onPress={handleAccept}
          disabled={qty > item.quantity}
        >
          <Text style={styles.acceptTxt}>Request</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------
 * Main screen component
 * ---------------------------------------------------------------- */
export default function EmergencyReceiveScreen() {
  const nav = useNavigation<any>();
  const insets = useSafeAreaInsets();
const [requests, setRequests] = useState<AidItem[]>([]);
  // Fetch real ads on mount, but keep your existing shape
useEffect(() => {
  (async () => {
    try {
      const token = await AsyncStorage.getItem('@token');
      const res = await fetch('http://20.174.11.55/api/advertisements', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Network response was not ok');
      const raw = await res.json() as Array<{
        id: number;
        services: string;
        quantity: string;
      }>;

      const filled: AidItem[] = raw.map(ad => ({
        id: ad.id.toString(),
        item: ad.services,
        quantity: parseInt(ad.quantity, 10),    // ← parse string to number
        donor: 'Anonymous',
      }));

      setRequests(filled);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Unable to load supplies');
    }
  })();
}, []);

  /* Header with icon + title */
  useLayoutEffect(() => {
    nav.setOptions({
      headerTitle: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image
            source={require('../assets/request.png')}
            style={{ width: 20, height: 20, marginRight: 6 }}
            resizeMode="contain"
          />
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: COLOR.primary }}>
            Request Aid
          </Text>
        </View>
      ),
    });
  }, [nav]);

  /* ------------------------------------------------------------------
   * State
   * ---------------------------------------------------------------- */
  const [searchTerm, setSearchTerm] = useState('');

  // request form state
  const [itemName, setItemName] = useState('');
  const [itemQty, setItemQty] = useState('');
  const [qtyError, setQtyError] = useState('');

  /* ------------------------------------------------------------------
   * Derived helpers
   * ---------------------------------------------------------------- */
  const filteredRequests = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return requests;
    return requests.filter(r => r.item.toLowerCase().includes(term));
  }, [searchTerm, requests]);

  const duplicateItem = useMemo(() => {
    const term = itemName.trim().toLowerCase();
    if (!term) return null;
    return requests.find(r => r.item.toLowerCase().includes(term));
  }, [itemName, requests]);

  /* ------------------------------------------------------------------
   * Accept handler (lifted up from AidCard)
   * ---------------------------------------------------------------- */
  const acceptAid = (id: string, qtyTaken: number) => {
    setRequests(prev =>
      prev.flatMap(item => {
        if (item.id !== id) return [item];
        const remaining = item.quantity - qtyTaken;
        if (remaining <= 0) return []; // remove when empty
        return [{ ...item, quantity: remaining }];
      }),
    );
    Alert.alert('Success', 'Aid accepted – thank you!');
  };

  /* ------------------------------------------------------------------
   * Submit new request handler (front‑end only)
   * ---------------------------------------------------------------- */
  const handleSubmit = () => {
    const name = itemName.trim();
    if (!name) {
      Alert.alert('Missing item', 'Please enter an item name.');
      return;
    }

    const qtyNum = Number.parseInt(itemQty, 10);
    if (Number.isNaN(qtyNum) || qtyNum < 1) {
      Alert.alert('Invalid quantity', 'Please enter a positive integer quantity.');
      return;
    }

    if (duplicateItem) {
      Alert.alert(
        'Item already available',
        `"${duplicateItem.item}" is already available. Please accept it from the list below.`,
      );
      return;
    }

    // no duplicate ⇒ in real app send to supplier – here just inform user
    Alert.alert('Request sent', 'Your request has been submitted.');
    setItemName('');
    setItemQty('');
  };

  /* ------------------------------------------------------------------
   * List header (request form + search bar)
   * ---------------------------------------------------------------- */
  const ListHeader = (
    <>
      {/* Request form */}
      <View style={styles.requestBox}>
        <Text style={styles.requestTitle}>Create a Request</Text>
        <TextInput
          placeholder="Aid item (e.g., Water)"
          style={styles.input}
          value={itemName}
          onChangeText={setItemName}
        />
        {duplicateItem && (
          <Text style={styles.duplicateTxt}>
            "{duplicateItem.item}" is already available – choose it from the list.
          </Text>
        )}
        <TextInput
          placeholder="Quantity"
          keyboardType="numeric"
          style={[styles.input, qtyError && styles.inputError]}
          value={itemQty}
          onChangeText={txt => {
            if (/^\d*$/.test(txt)) {          // digits (or empty)
              setItemQty(txt);
              setQtyError('');
            } else {                          // non-numeric typed
              setQtyError('Numbers only');
            }
          }}
        />
        {qtyError ? <Text style={styles.errorTxt}>{qtyError}</Text> : null}
        <TouchableOpacity
          style={[styles.requestSubmit, (duplicateItem || !itemName.trim() || qtyError) && styles.btnDisabled,]}
          onPress={handleSubmit}
          disabled={!!duplicateItem || !itemName.trim()}
        >
          <Text style={styles.requestSubmitTxt}>Submit</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <TextInput
        placeholder="Search available supplies"
        placeholderTextColor={COLOR.primaryDim}
        value={searchTerm}
        onChangeText={setSearchTerm}
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.search}
      />

    </>
  );

return (
  <View style={[styles.container, { paddingBottom: insets.bottom }]}>
    <FlatList
      data={filteredRequests}
      keyExtractor={item => item.id}
      renderItem={({ item }) => <AidCard item={item} onAccept={acceptAid} />}
      ListHeaderComponent={ListHeader}

      /* 👇 NEW: logo scrolls with the list */
      ListFooterComponent={() => (
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <Logo />
        </View>
      )}

      ListEmptyComponent={() => (
        <Text style={styles.emptyTxt}>No matching items found.</Text>
      )}

      contentContainerStyle={ {
      paddingTop: 24,
      paddingHorizontal: 24,
      paddingBottom: 0}}

      showsVerticalScrollIndicator={false}
    />
  </View>
);
}

/* ------------------------------------------------------------------
 * Styles
 * ---------------------------------------------------------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLOR.canvas },

  btnDisabled: {
    backgroundColor: COLOR.primaryDim,
  },

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
    color: COLOR.primary,
  },


  /* Aid card */
  card: {
    backgroundColor: COLOR.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EFE7DC',
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLOR.primary,
    marginBottom: 6,
  },
  qtyControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrowBtn: {
    padding: 2,
    borderWidth: 1,
    borderColor: COLOR.primary,
    borderRadius: 4,
    marginHorizontal: 2,
  },
  arrowBtnDisabled: { borderColor: COLOR.textLight },
  qtyValue: {
    width: 32,
    textAlign: 'center',
    fontWeight: 'bold',
    color: COLOR.primary,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  availTxt: { fontSize: 12, color: COLOR.textLight, flex: 1, marginRight: 10 },
  acceptBtn: {
    backgroundColor: COLOR.primary,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  acceptTxt: { color: COLOR.white, fontWeight: 'bold', fontSize: 13 },

  /* Request form */
  requestBox: {
    width: '90%',
    alignSelf: 'center',
    backgroundColor: COLOR.white,
    borderRadius: 10,
    padding: 16,
    borderWidth: 2,
    borderColor: COLOR.primary,
    marginBottom: 24,
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLOR.primary,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: COLOR.primary,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 10,
    color: COLOR.primary,
  },
  requestSubmit: {
    backgroundColor: COLOR.primary,
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  requestSubmitTxt: { color: COLOR.white, fontWeight: 'bold' },

  /* Duplicate item warning */
  duplicateTxt: {
    color: COLOR.error,
    fontSize: 13,
    marginBottom: 8,
  },

  /* Empty list */
  emptyTxt: {
    textAlign: 'center',
    color: COLOR.textLight,
    marginVertical: 20,
  },
  inputError: { borderColor: COLOR.error },
  errorTxt:   { color: COLOR.error, fontSize: 12, marginBottom: 6 },


});
