import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  useWindowDimensions,
  ActivityIndicator,
  Modal,
  Image,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useNavigation,
  useFocusEffect,
  CommonActions,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ServicesStackParamList } from '../navigation/ServicesStack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Logo from '../components/Logo';

const REQUESTS_BANNER = require('../assets/requests.png');
let imgW = 1,
  imgH = 1;
if (Platform.OS !== 'web') {
  // @ts-ignore
  const src = (Image as any).resolveAssetSource(REQUESTS_BANNER);
  imgW = src.width;
  imgH = src.height;
}
const requestsRatio = imgW / imgH;

/* ------------------------------------------------------------------ */
/* Types */
/* ------------------------------------------------------------------ */
interface Offer {
  id: string;
  status: 'pending' | 'accepted' | 'declined';
  price?: string;
  comments?: string;
}
interface RequestItem {
  id: string;
  title: string;
  postedLocation: string;
  status: string;
  serviceType: 'Home' | 'Vehicle' | 'Emergency';
  date: string;
  offers: Offer[];
}

/* ------------------------------------------------------------------ */
/* Component */
/* ------------------------------------------------------------------ */
export default function MyRequestsScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const navigation =
    useNavigation<NativeStackNavigationProp<ServicesStackParamList>>();

  /* ---------------- Auth gate ---------------- */
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem('@token').then(token => {
        setIsAuthenticated(!!token);
      });
    }, [])
  );

  /* ---------------- State ---------------- */
  const [tab, setTab] = useState<'All' | 'History'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<RequestItem | null>(null);
  const [showModal, setShowModal] = useState(false);

  /* ------------------------------------------------------------------ */
  /* API helpers */
  /* ------------------------------------------------------------------ */
  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await AsyncStorage.getItem('@token');
      if (!token) throw new Error('Login first');

      const response = await fetch('http://20.174.11.55/api/my-tasks', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const json = await response.json();
      const mappedData: RequestItem[] = json.map((item: any) => ({
        id: String(item.id),
        title: item.title,
        postedLocation: item.location,
        status: item.status,
        serviceType: item.casa
          ? 'Home'
          : item.car_brand
          ? 'Vehicle'
          : 'Emergency',
        date: item.created_at.split('T')[0],
        offers: item.offers.map((offer: any) => ({
          id: String(offer.id),
          status: offer.status as Offer['status'],
          price: offer.price,
          comments: offer.comments,
        })),
      }));

      setData(mappedData);
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const respondToOffer = async (
    offerId: string,
    responseValue: 'accepted' | 'declined'
  ) => {
    try {
      const token = await AsyncStorage.getItem('@token');
      if (!token) return;

      const response = await fetch(
        `http://20.174.11.55/api/offers/${offerId}/respond`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ response: responseValue }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed (${response.status})`);
      }

      alert('Success');
      fetchTasks();
    } catch (err: any) {
      console.error(err);
      alert('Something went wrong, please try again.');
    }
  };

  /* ------------------------------------------------------------------ */
  /* Lifecycle – fetch only when authenticated */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchTasks();
    const id = setInterval(fetchTasks, 10000);
    return () => clearInterval(id);
  }, [isAuthenticated]);

  /* ------------------------------------------------------------------ */
  /* Early return – login prompt */
  /* ------------------------------------------------------------------ */
  if (!isAuthenticated) {
    return (
      <View
        style={[
          styles.container,
          {
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: insets.top,
            paddingBottom: insets.bottom + 24,
          },
        ]}
      >
        <Text style={styles.placeholderText}>
          Login to see your requests
        </Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() =>
            navigation.dispatch(
              CommonActions.reset({
                index: 1,
                routes: [{ name: 'Index' }, { name: 'Login' }],
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

  /* ------------------------------------------------------------------ */
  /* Filtering */
  /* ------------------------------------------------------------------ */
  const filtered = data.filter(item => {
    const hasAnswer = item.offers.some(
      o => o.status === 'accepted' || o.status === 'declined'
    );
    const searchMatch = item.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    if (tab === 'All') return !hasAnswer && searchMatch;
    if (tab === 'History') return hasAnswer && searchMatch;
    return false;
  });

  /* ------------------------------------------------------------------ */
  /* Render helpers */
  /* ------------------------------------------------------------------ */
  const renderItem = ({ item }: { item: RequestItem }) => {
    const pendingOffer = item.offers.find(o => o.status === 'pending');
    const acceptedOffer = item.offers.find(o => o.status === 'accepted');
    const declinedOffer = item.offers.find(o => o.status === 'declined');

    let badgeText = 'Pending';
    let badgeStyle = styles.badgePending;
    if (pendingOffer) {
      badgeText = 'Waiting your confirmation';
    }
    if (acceptedOffer) {
      badgeText = 'Accepted';
      badgeStyle = styles.badgeAccepted;
    }
    if (declinedOffer) {
      badgeText = 'Declined';
      badgeStyle = styles.badgeDeclined;
    }

    return (
      <View style={[styles.card, { width: width - 32 }]}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <Text
            style={styles.cardTitle}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.title}
          </Text>
          <View style={[styles.badge, badgeStyle]}>
            <Text style={styles.badgeText}>{badgeText}</Text>
          </View>
        </View>

        <Text style={styles.posted}>Posted at: {item.postedLocation}</Text>

        {/* Details button */}
        <TouchableOpacity
          style={styles.detailButton}
          onPress={() => {
            setSelectedTask(item);
            setShowModal(true);
          }}
        >
          <Text style={styles.detailButtonText}>More details</Text>
        </TouchableOpacity>

        {/* Offer actions */}
        {pendingOffer && tab === 'All' && (
          <>
            <View style={{ marginTop: 12 }}>
              <Text style={{ fontWeight: 'bold' }}>Price:</Text>
              <Text>
                {pendingOffer.price ? `${pendingOffer.price} $` : '–'}
              </Text>
              <Text>Comments: {pendingOffer.comments ?? '–'}</Text>
            </View>

            <View style={{ flexDirection: 'row', marginTop: 12 }}>
              <TouchableOpacity
                style={[styles.actionButton, styles.actionAccept]}
                onPress={() => respondToOffer(pendingOffer.id, 'accepted')}
              >
                <Text style={styles.detailButtonText}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.actionDecline]}
                onPress={() => respondToOffer(pendingOffer.id, 'declined')}
              >
                <Text style={[styles.detailButtonText, styles.declineText]}>
                Decline
              </Text>

              </TouchableOpacity>
            </View>
          </>
        )}

        {/* History view */}
        {tab === 'History' && (acceptedOffer || declinedOffer) && (
          <View style={{ marginTop: 12 }}>
            <Text style={{ fontWeight: 'bold' }}>Details:</Text>
            <Text>
              Price:{' '}
              {acceptedOffer?.price ?? declinedOffer?.price ?? '–'} $
            </Text>
            <Text>
              Comments:{' '}
              {acceptedOffer?.comments ?? declinedOffer?.comments ?? '–'}
            </Text>
            <Text>
              Status:{' '}
              {acceptedOffer ? 'Accepted' : declinedOffer ? 'Declined' : ''}
            </Text>
          </View>
        )}
      </View>
    );
  };

  /* ------------------------------------------------------------------ */
  /* JSX */
  /* ------------------------------------------------------------------ */
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Image
        source={REQUESTS_BANNER}
        style={styles.hero}
        resizeMode="contain"
      />

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          onPress={() => setTab('All')}
          style={[styles.tab, tab === 'All' && styles.tabActive]}
        >
          <Text style={[styles.tabText, tab === 'All' && styles.tabTextActive]}>
            All jobs
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setTab('History')}
          style={[styles.tab, tab === 'History' && styles.tabActive]}
        >
          <Text
            style={[
              styles.tabText,
              tab === 'History' && styles.tabTextActive,
            ]}
          >
            Jobs history
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search requests"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
      </View>

      {/* Error */}
      {error && (
        <Text
          style={{
            color: '#F44336',
            marginHorizontal: 16,
            marginBottom: 8,
          }}
        >
          {error}
        </Text>
      )}

      {/* List / Loader */}
      {loading && data.length === 0 ? (
        <ActivityIndicator
          style={{ marginTop: 20 }}
          size="large"
          color="#3E575D"
        />
      ) : (
        <FlatList
          style={{ flex: 1 }}
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          onRefresh={fetchTasks}
          refreshing={loading}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'space-between',
            paddingBottom: insets.bottom + 24,
          }}
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
          ListFooterComponent={() => (
            <View style={{ alignItems: 'center' }}>
              <Logo />
            </View>
          )}
        />
      )}
      {/* Modal de détails */}
<Modal
  visible={showModal}
  animationType="slide"
  transparent={true}
  onRequestClose={() => setShowModal(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContainer}>
      <Text style={styles.modalTitle}>{selectedTask?.title}</Text>
      <Text>Date : {selectedTask?.date}</Text>
      <Text>Type of service : {selectedTask?.serviceType}</Text>
      <Text>Location : {selectedTask?.postedLocation}</Text>

      <View style={{ marginTop: 16 }}>
        <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>
          The offer details:
        </Text>
        {selectedTask?.offers.length ? (
          selectedTask.offers.map((offer) => (
            <View key={offer.id} style={styles.offerItem}>
              <Text>ID offre : {offer.id}</Text>
              <Text>Price : {offer.price ?? '–'} $</Text>
              <Text>Comments : {offer.comments ?? '–'}</Text>
              <Text>Status : {offer.status}</Text>

              {offer.status === 'pending' && (
                <View style={styles.offerActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.actionAccept]}
                    onPress={() => {
                      respondToOffer(offer.id, 'accepted');
                      setShowModal(false);
                    }}
                  >
                    <Text style={styles.detailButtonText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.actionDecline]}
                    onPress={() => {
                      respondToOffer(offer.id, 'declined');
                      setShowModal(false);
                    }}
                  >
                    <Text style={[styles.detailButtonText, styles.declineText]}>
                      Decline
                    </Text>

                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        ) : (
          <Text>Still no offer yet</Text>
        )}
      </View>

      <TouchableOpacity
        onPress={() => setShowModal(false)}
        style={styles.closeButton}
      >
        <Text style={styles.detailButtonText}>Close</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Styles */
/* ------------------------------------------------------------------ */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
    paddingHorizontal: 16,
  },
  hero: {
    width: '65%',
    height: 100,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginTop: 75,
    marginVertical: 50,
  },

  /* Tabs */
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderColor: '#ccc',
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 3, borderColor: '#3E575D' },
  tabText: { color: '#777' },
  tabTextActive: { color: '#3E575D', fontWeight: 'bold' },

  /* Search */
  searchContainer: { paddingHorizontal: 16, marginVertical: 8 },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },

  /* Card */
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
    maxWidth: '70%',
  },
  posted: { marginTop: 4, color: '#555' },

  /* Badge */
  badge: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: { color: '#fff', fontSize: 11 },
  badgePending: { backgroundColor: '#FFC107' },
  badgeAccepted: { backgroundColor: '#4CAF50' },
  badgeDeclined: { backgroundColor: '#F44336' },

  /* Buttons */
  detailButton: {
    marginTop: 12,
    backgroundColor: '#3E575D',
    borderRadius: 6,
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  detailButtonText: { color: '#fff', fontSize: 14 },
  actionButton: {
    flex: 1,
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
  },
  actionAccept: { backgroundColor: '#3E575D', marginRight: 8 },
  actionDecline: {
  backgroundColor: '#FFFFFF',
  borderWidth: 1,
  borderColor: '#3E575D',
},
declineText: {
  color: '#3E575D',
},

  /* Login gate */
  placeholderText: {
    fontSize: 18,
    color: '#3E575D',
    marginBottom: 16,
  },
  loginButton: {
    backgroundColor: '#3E575D',
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  offerItem: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingVertical: 8,
  },
  offerActions: {
    flexDirection: 'row',
    marginTop: 8,
  },
  closeButton: {
    marginTop: 16,
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#3E575D',
    borderRadius: 4,
  },
  
});
