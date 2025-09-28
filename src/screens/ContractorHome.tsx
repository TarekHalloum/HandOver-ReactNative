/* -------------------------------------------------------------------------- */
/*  ContractorHome.tsx                                                        */
/* -------------------------------------------------------------------------- */
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  Modal,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Logo from '../components/Logo';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

/* -------------------------------------------------------------------------- */
/*  Helpers & types                                                           */
/* -------------------------------------------------------------------------- */
type Tab = 'PENDING' | 'ACCEPTED' | 'DECLINED';

interface RequestItem {
  id: string;
  title: string;
  location: string;
  serviceType: 'Vehicle' | 'Home' | 'Emergency';
  status: Tab;           // Upper-case !
  hasOffer: boolean;     // true si CE contractor a déjà envoyé une offre
  price?: string;
  comments?: string;
  service_name:string;
}
const BOTTOM_GAP = 24;
const statusColors: Record<Tab, { color: string }> = {
  PENDING:  { color: '#FFC107' },
  ACCEPTED: { color: '#4CAF50' },
  DECLINED: { color: '#F44336' },
};

async function safeFetchJSON(url: string, token: string) {
  try {
    const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!r.ok) {
      if (r.status === 404) return [];
      throw new Error(`HTTP ${r.status}`);
    }
    if (!(r.headers.get('content-type') ?? '').includes('json')) return [];
    return r.json();
  } catch (e) {
    console.warn('safeFetchJSON', url, e);
    return [];
  }
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */
export default function ContractorHome() {
  const insets = useSafeAreaInsets();
  /* UI */
  const [tab,   setTab]   = useState<Tab>('PENDING');
  const [search, setSearch] = useState('');
  const [data, setData]     = useState<RequestItem[]>([]);
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [priceErr, setPriceErr]     = useState('');
  const [commentsErr, setCommentsErr] = useState('');
  /* Modal */
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [price, setPrice]       = useState('');
  const [comments, setComments] = useState('');
  const [selectedTask, setSelectedTask] = useState<RequestItem | null>(null);

  /* ---------------------------------------------------------------------- */
  /*  Loading tasks & offers                                                */
  /* ---------------------------------------------------------------------- */
/* ---------------------------------------------------------------------- */
/*  loadAll – version dé-doublonnée                                       */
/* ---------------------------------------------------------------------- */
const loadAll = useCallback(async () => {
  try {
    if (!refreshing) setLoading(true);
    const token = await AsyncStorage.getItem('@token');
    if (!token) throw new Error('Token missing');

    /* Fetch parallèles */
    const [availableJson, offersJson] = await Promise.all([
      safeFetchJSON('http://20.174.11.55/api/available-tasks', token),
      safeFetchJSON('http://20.174.11.55/api/my-offers',       token),
    ]);

    /* --- Mapping offres ------------------------------------------------- */
    const offersMap = new Map<string, RequestItem>();
    (offersJson as any[]).forEach(o => {
      const item: RequestItem = {
        id: String(o.task?.id ?? o.task_id),
        title: o.task?.title ?? o.title,
        location: o.task?.location ?? o.location,
        serviceType: o.task?.car_brand
          ? 'Vehicle'
          : o.task?.casa
          ? 'Home'
          : 'Emergency',
        status: (o.status ?? 'pending').toUpperCase() as Tab,
        hasOffer: true,
        price: String(o.price ?? ''),
        comments: o.comments ?? '',
        service_name: o.service_name
      };
      offersMap.set(item.id, item);      // clé unique => écrase doublons
    });

    /* --- Mapping tâches « libres » -------------------------------------- */
    (availableJson as any[]).forEach(t => {
      const id = String(t.id);
      if (offersMap.has(id)) return;     // déjà une offre → on ignore
      offersMap.set(id, {
        id,
        title: t.title,
        location: t.location,
        serviceType: t.car_brand ? 'Vehicle' : t.casa ? 'Home' : 'Emergency',
        status: 'PENDING',
        hasOffer: false,
        service_name:t.service_name
      });
    });

    /* --- Résultat final -------------------------------------------------- */
    setData(Array.from(offersMap.values()));
  } catch (e) {
    console.error(e);
    Alert.alert('Erreur', 'Impossible de charger les données.');
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
}, [refreshing]);


  useEffect(() => {
     loadAll(); 
         const intervalId = setInterval(() => {
    loadAll();
  }, 10000); // every 10 seconds

  return () => clearInterval(intervalId); // cleanup on unmount
    }, [loadAll]);

  const onRefresh = () => setRefreshing(true);

  /* ---------------------------------------------------------------------- */
  /*  Send offer                                                            */
  /* ---------------------------------------------------------------------- */
  // const openModal = (taskId: string) => {
  //   setSelectedTaskId(taskId);
  //   setPrice('');
  //   setComments('');
  //   setModalVisible(true);
  // };
const openModal = (item: RequestItem) => {
  setSelectedTaskId(item.id);
  setSelectedTask(item);
  setPrice(item.price ?? '');
  setComments(item.comments ?? '');
  setPriceErr('');
  setCommentsErr('');
  setModalVisible(true);
};

    const submitOffer = async () => {
      // 1) Clear existing error messages
      setPriceErr('');
      setCommentsErr('');

      // 2) Validate price
      if (!price.trim()) {
        setPriceErr('You must enter a price.');
        return;
      }

      // 3) Validate comments
      if (!comments.trim()) {
        setCommentsErr('The comments field cannot be empty.');
        return;
      }

      // 4) Ensure a task is selected (shouldn't ever fail here)
      if (!selectedTaskId) return;

      // 5) Proceed with API call
      try {
        const token = await AsyncStorage.getItem('@token');
        if (!token) throw new Error('No token');

        const r = await fetch(
          `http://20.174.11.55/api/tasks/${selectedTaskId}/offer`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              price: parseFloat(price),
              comments,
            }),
          }
        );
        if (!r.ok) throw new Error(`HTTP ${r.status}`);

        // 6) Success feedback
        Alert.alert('Success', 'Offer Sent!');
        setModalVisible(false);
        loadAll(); // rafraîchir la liste
      } catch (e) {
        console.error(e);
        Alert.alert('Error', "Offre Not Sent.");
      }
    };


  /* ---------------------------------------------------------------------- */
  /*  Filtering                                                             */
  /* ---------------------------------------------------------------------- */
  const filtered = data.filter(item => {
    if (tab === 'PENDING') {
      // Montre : 1) tâches sans offre ; 2) offres en attente de décision
      return item.status === 'PENDING' &&
             item.title.toLowerCase().includes(search.toLowerCase());
    }
    // ACCEPTED / DECLINED : seulement les tâches AVEC une offre
    return item.hasOffer &&
           item.status === tab &&
           item.title.toLowerCase().includes(search.toLowerCase());
  });

  /* ---------------------------------------------------------------------- */
  /*  Render item                                                           */
  /* ---------------------------------------------------------------------- */
  const renderItem = ({ item }: { item: RequestItem }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={[styles.cardStatus, statusColors[item.status]]}>
          {item.status}
        </Text>
      </View>
      <Text style={styles.cardText}>
        Service Name: <Text style={styles.bold}>{item.service_name}</Text>
      </Text>
      <Text style={styles.cardTitle}>
        Title: <Text style={styles.bold}>{item.title}</Text>
      </Text>
      <Text style={styles.cardText}>
        Location: <Text style={styles.bold}>{item.location}</Text>
      </Text>
      <Text style={styles.cardText}>
        Service Type: <Text style={styles.bold}>{item.serviceType}</Text>
      </Text>

      {item.status === 'PENDING' && !item.hasOffer ? (
        /* Cas 1 : pas encore d’offre → bouton « Make Offer » */
        <View style={styles.cardActions}>
          <TouchableOpacity
             style={[styles.button, { backgroundColor: '#3E575D' }]}
              onPress={() => openModal(item)}
          >
            <Text style={styles.buttonText}>Make Offer</Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* Cas 2 : offre déjà envoyée (pending / accepted / declined) */
        <View style={{ marginTop: 8 }}>
          <Text style={styles.cardText}>
            Price: <Text style={styles.bold}>{item.price ?? '-'}</Text>
          </Text>
          <Text style={styles.cardText}>
            Comments: <Text style={styles.bold}>{item.comments ?? '-'}</Text>
          </Text>
        </View>
      )}
    </View>
  );

  /* ---------------------------------------------------------------------- */
  /*  JSX                                                                   */
  /* ---------------------------------------------------------------------- */
  return (
    <View style={styles.container}>
      {/* ---------- Header ------------------------------------------------- */}


      <Image
        source={require('../assets/contractorH.png')}
        style={styles.hero}
      />
      {/* ---------- Search ------------------------------------------------- */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color="#868686" style={styles.searchIcon} />
        <TextInput
          placeholder="Search"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
      </View>

      {/* ---------- Tabs --------------------------------------------------- */}
      <View style={styles.tabs}>
        {(['PENDING', 'ACCEPTED', 'DECLINED'] as const).map(status => (
          <TouchableOpacity
            key={status}
            onPress={() => setTab(status)}
            style={[styles.tabButton, tab === status && styles.tabActive]}
          >
            <Text style={[styles.tabText, tab === status && styles.tabTextActive]}>
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ---------- List --------------------------------------------------- */}
      {loading && !refreshing ? (
        <ActivityIndicator style={{ marginTop: 20 }} size="large" color="#3E575D" />
      ) : (
          <FlatList
            style={{ flex: 1 }}
            data={filtered}
            keyExtractor={item => (item.hasOffer ? `offer-${item.id}` : `task-${item.id}`)}
            renderItem={renderItem}
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: 'space-between',
              paddingBottom: insets.bottom + BOTTOM_GAP,
            }}
            ListEmptyComponent={
              <Text style={{ textAlign: 'center', marginTop: 20 }}>
                No tasks found.
              </Text>
            }
            ListFooterComponent={() => (
              <View style={{ alignItems: 'center' }}>
                <Logo />
              </View>
            )}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          />
      )}

      <Modal
  visible={modalVisible}
  animationType="slide"
  transparent
  onRequestClose={() => setModalVisible(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContainer}>
      {/* JOB DETAILS */}
      <Text style={styles.modalTitle}>
        {selectedTask?.title}
      </Text>
      <Text>Job ID: {selectedTask?.id}</Text>
      <Text>Status: {selectedTask?.status}</Text>
      <Text>Type: {selectedTask?.serviceType}</Text>
      <Text>Location: {selectedTask?.location}</Text>
      {/* If you have a date field, include it here */}
      {/* <Text>Date Posted: {selectedTask?.date}</Text> */}

      {selectedTask?.hasOffer ? (
        /* SHOW EXISTING OFFER */
        <View style={{ marginTop: 16 }}>
          <Text style={styles.sectionTitle}>Your Offer</Text>
          <Text>Price: {selectedTask.price} $</Text>
          <Text>Comments: {selectedTask.comments}</Text>
        </View>
      ) : (
        /* SUBMIT A NEW OFFER */
        <>
          <Text style={[styles.sectionTitle, { marginTop: 16 }]}>
            Submit an Offer
          </Text>
          
          <TextInput
            placeholder="Price"
            value={price}
            keyboardType="numeric"
            style={styles.modalInput}
            onChangeText={txt => 
              setPrice(txt.replace(/[^0-9]/g, ''))
            }
          />
          {priceErr ? <Text style={styles.err}>{priceErr}</Text> : null}

          <TextInput
            placeholder="Comments"
            value={comments}
            onChangeText={setComments}
            multiline
            style={[styles.modalInput, { height: 80 }]}
          />
          {commentsErr ? <Text style={styles.err}>{commentsErr}</Text> : null}

          <View style={styles.modalButtons}>
            <TouchableOpacity
               style={[styles.button, { backgroundColor: '#3E575D' }]}
              onPress={submitOffer}
            >
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* CLOSE BUTTON */}
      <TouchableOpacity
        onPress={() => setModalVisible(false)}
        style={
                [
                  styles.button,
                  {
                    backgroundColor: '#FFFFFF',
                    borderWidth: 1,
                    borderColor: '#3E575D',
                    marginTop: 8,
                  }
                ]
              }
      >
        <Text style={[styles.buttonText, { color: '#3E575D' }]}>Close</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

    
    </View>
    
  );
  
}

/* -------------------------------------------------------------------------- */
/*  Styles                                                                    */
/* -------------------------------------------------------------------------- */
const styles = StyleSheet.create({
container: {
  flex: 1,
  backgroundColor: '#FAF9F6',
  paddingHorizontal: 16, 
  paddingTop: 8,         
},

  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  title:  { marginLeft: 8, fontSize: 18, fontWeight: 'bold', color: '#3E575D' },

  searchContainer: { flexDirection: 'row', alignItems: 'center',
                     backgroundColor: '#fff', borderRadius: 8,
                     marginVertical: 8, paddingHorizontal: 8 },
  searchIcon:  { marginRight: 4 },
  searchInput: { flex: 1, height: 40 },

  tabs: { flexDirection: 'row', marginVertical: 8 },
  tabButton: { flex: 1, paddingVertical: 8, alignItems: 'center',
               borderBottomWidth: 2, borderColor: '#ccc' },
  tabActive: { borderColor: '#3E575D' },
  tabText: { color: '#777' },
  tabTextActive: { color: '#3E575D', fontWeight: 'bold' },

  card: { backgroundColor: '#fff', borderRadius: 10, padding: 16,
          marginVertical: 8, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between',
                marginBottom: 8 },
  cardStatus: { fontWeight: 'bold', fontSize: 13 },

  cardTitle: { fontSize: 14, marginBottom: 4 },
  cardText:  { fontSize: 13, marginBottom: 4 },
  bold:      { fontWeight: 'bold' },

  cardActions: { flexDirection: 'row', marginTop: 8 },
  button:      { flex: 1, paddingVertical: 8, marginHorizontal: 4,
                 borderRadius: 6, alignItems: 'center' },
  accept:      { backgroundColor: '#4CAF50' },
  reject:      { backgroundColor: '#F44336' },
  buttonText:  { color: '#fff' },

  modalOverlay:   { flex: 1, justifyContent: 'center', alignItems: 'center',
                    backgroundColor: 'rgba(0,0,0,0.4)' },
  modalContainer: { backgroundColor: '#fff', padding: 20, borderRadius: 10,
                    width: '80%' },
  modalTitle:     { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },

  modalButtons:   { flexDirection: 'row', justifyContent: 'space-between',
                    marginTop: 16 },

logo: {
  alignSelf: 'center',
  marginVertical: 8,
},
  hero: {
    width: '65%',
    height: 100,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginTop: 75,
    marginVertical: 50,
  },
sectionTitle: {
  fontWeight: 'bold',
  marginBottom: 4,
},
modalInput: {
  backgroundColor: '#eee',
  borderRadius: 8,
  paddingHorizontal: 10,
  marginVertical: 8,
  height: 40,
},
err: {
  color: '#D72638',
  fontSize: 12,
  marginTop: 4,
  marginBottom: 8,
},

});
                 
