import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

interface Scan {
  id: number;
  service_name: string;
  car_brand: string;
  damaged_parts: string;
}

export default function MyScansScreen() {
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchScans = async () => {
        try {
          const token = await AsyncStorage.getItem('@token');
          const response = await axios.get(
            'http://20.174.11.55/api/damaged-scans',
            { headers: { Authorization: `Bearer ${token}` } }
          );
          // map or cast API data to our Scan type
          setScans(response.data.data);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchScans();
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.emptyBox}>
        <Text style={styles.emptyText}>Loading…</Text>
      </View>
    );
  }

  if (scans.length === 0) {
    return (
      <View style={styles.emptyBox}>
        <Text style={styles.emptyText}>No scans.</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: Scan }) => (
    <View style={styles.itemBox}>
      <Text style={styles.label}>
        Service: <Text style={styles.value}>{item.service_name}</Text>
      </Text>
      <Text style={styles.label}>
        Brand: <Text style={styles.value}>{item.car_brand}</Text>
      </Text>
      <Text style={styles.label}>
        Damaged Parts:{' '}
        <Text style={styles.value}>{item.damaged_parts}</Text>
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={scans}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F6', padding: 16 },
  list: { paddingTop: 16 },
  itemBox: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EFE7DC',
  },
  label: {
    fontSize: 14,
    color: '#3E575D',
    marginBottom: 4,
  },
  value: {
    fontWeight: '600',
  },
  emptyBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#868686',
    fontSize: 16,
  },
});
