// src/screens/HomeScreen.tsx
// HandOver ▸ Guest / Normal‑user Home (balanced logo + refined spacing + reusable Logo component + expandable service cards)
// Palette: #3E575D, #EFE7DC, #FAF9F6, #FFFFFF
// -----------------------------------------------------------------------------
import React, {  useRef, useState, useCallback, useEffect, useMemo  } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  Alert,
  TextInput,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useNavigation , useFocusEffect} from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Logo from '../components/Logo';

/* ------------------------------------------------------------------
 * Colours
 * ---------------------------------------------------------------- */
const COLOR = {
  primary: '#3E575D',
  accent: '#EFE7DC',
  canvas: '#FAF9F6',
  white: '#FFFFFF',
};
const BOTTOM_GAP = 24;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const useNav = () => useNavigation<any>();

/* ------------------------------------------------------------------
 * Helpers
 * ---------------------------------------------------------------- */
function getRatio(src: any, fallback = 1) {
  if (typeof (Image as any)?.resolveAssetSource === 'function') {
    const { width: w, height: h } = (Image as any).resolveAssetSource(src) || {};
    if (w && h) return w / h;
  }
  return fallback;
}

/* ------------------------------------------------------------------
 * Details text for each service
 * ---------------------------------------------------------------- */
const SERVICE_INFO = {
  home: 'Book skilled trades for plumbing, painting, electrical & more. AI Color Detection helps pick paint colors from photos. Matched by proximity & ratings.',
  vehicle: 'Upload a car image & get instant AI damage & brand detection. Creates repair tickets with annotated images & severity, matched with certified workshops.',
  aid: 'Request or donate essentials (food, mattresses, shelter, cash). Real-time matching, inventory locks & urgency prioritization ensure fast delivery.',
};

/* ------------------------------------------------------------------
 * ServiceCard component
 * ---------------------------------------------------------------- */
interface ServiceCardProps {
  title: string;
  subtitle: string;
  badge?: string;
  img: any;
  expanded?: boolean;
  detailText?: string;
  onPress: () => void;
  onBadgePress?: () => void;
}

const ServiceCard = ({
  title,
  subtitle,
  badge,
  img,
  expanded,
  detailText,
  onPress,
  onBadgePress,
}: ServiceCardProps) => (
  <TouchableOpacity
    style={[styles.card, expanded && styles.cardExpanded]}
    onPress={onPress}
    activeOpacity={0.85}
  >
    <Image source={img} style={styles.cardImg} resizeMode="contain" />
    <View style={{ flex: 1 }}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardSub}>{subtitle}</Text>
      {badge && !expanded && (
        <TouchableOpacity
          style={styles.cardBadge}
          onPress={onBadgePress}
          activeOpacity={0.8}
        >
          <Text style={styles.cardBadgeTxt}>{badge}</Text>
        </TouchableOpacity>
      )}
      {expanded && detailText && (
        <Text style={styles.detailText}>{detailText}</Text>
      )}
    </View>
    <Text style={styles.chevron}>{expanded ? '˄' : '˅'}</Text>
  </TouchableOpacity>
);

interface ApiService { id: number; service_name: string; }
interface SearchItem {
  id: string;
  name: string;
  icon: any;
  type: 'building' | 'vehicle';
}
const ICON_BUILDING = require('../assets/home2.png');     // or any “house” icon you prefer
const ICON_VEHICLE  = require('../assets/vehicle2.png');  // or any “car”  icon you prefer
// const PLACEHOLDER_ICON = 'https://dummyimage.com/64x64/3E575D/ffffff&text=🔧';
/* ------------------------------------------------------------------
 * HomeScreen component
 * ---------------------------------------------------------------- */
export default function HomeScreen() {
  const nav = useNav();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [partnerY, setPartnerY] = useState(0);
  const [highlight, setHighlight] = useState(false);
const [isAuthenticated, setIsAuthenticated] = useState(false);
  // which service is expanded ('home' | 'vehicle' | 'aid' | null)
  const [expandedService, setExpandedService] = useState<string | null>(null);
  const [query, setQuery] = useState(''); 
  const [data, setData] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // 🆕 fetch building + vehicle services once
  useEffect(() => {
    const abort = new AbortController();
    Promise.all([
      fetch('http://20.174.11.55/api/services/building', { signal: abort.signal })
        .then(r => r.json() as Promise<ApiService[]>),
      fetch('http://20.174.11.55/api/services/vehicle',  { signal: abort.signal })
        .then(r => r.json() as Promise<ApiService[]>),
    ])
      .then(([build, veh]) => {
        const items: SearchItem[] = [
          ...build.map((s): SearchItem => ({
            id: `b-${s.id}`,
            name: s.service_name,
            icon: ICON_BUILDING,
            type: 'building',
          })),
          ...veh.map((s): SearchItem => ({
            id: `v-${s.id}`,
            name: s.service_name,
            icon: ICON_VEHICLE,
            type: 'vehicle',
          })),
        ];
        setData(items);
      })
      .catch(err => {
        if (err.name !== 'AbortError') setError('Unable to load services');
      })
      .finally(() => setLoading(false));

    return () => abort.abort();
  }, []);
const shown = useMemo(
  () =>
     query.length > 0
  ? data.filter(item =>
    item.name.toLowerCase().includes(query.toLowerCase())
    )
    : [],
    [data, query]
    );
const handleSearchPress = (item: SearchItem) => {
  const screenName = item.type === 'building'
    ? 'ServiceDetails'
    : 'ServiceDetails2';

  nav.navigate('Services', {
    screen: screenName,
    params: {
      id:       item.id.split('-')[1],
      name:     item.name,
      fromHome: true,          // ← tag so header knows we came from Home
    },
  });
};

const renderItem = ({ item }: { item: SearchItem }) => (
  <TouchableOpacity
    style={[styles.tile, { width: width / 2 - 24 }]}
    onPress={() => handleSearchPress(item)}
    activeOpacity={0.85}
  >
    {/* local image, no uri wrapper */}
    <Image source={item.icon} style={styles.icon} resizeMode="contain" />
    <Text numberOfLines={2} style={styles.label}>{item.name}</Text>
  </TouchableOpacity>
);


  useFocusEffect(
  useCallback(() => {
    AsyncStorage.getItem('@token').then(token => {
      setIsAuthenticated(!!token);
    });
  }, [])
);
  const toggle = (key: string) => {
    setExpandedService(prev => (prev === key ? null : key));
  };

  const handleBannerPress = () => {
    scrollRef.current?.scrollTo({ y: partnerY, animated: true });
    let toggles = 0;
    const interval = setInterval(() => {
      setHighlight(h => !h);
      if (++toggles >= 6) {
        clearInterval(interval);
        setHighlight(false);
      }
    }, 300);
  };

  /* Collage */
  const COLLAGE_SRC = require('../assets/1-1.png');
  const collageRatio = getRatio(COLLAGE_SRC, 1.64);
  const MAX_COLLAGE_HEIGHT = 260;
  const HOME_BANNER = require('../assets/homeH.png');
  const homeRatio   = getRatio(HOME_BANNER, 2.2);

  return (
  <View style={styles.page}>  
    <ScrollView
      ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.container}   
        showsVerticalScrollIndicator={false}
    >

        <View style={styles.bannerBox}>
    <Image
      source={HOME_BANNER}
      style={{ width: width * 0.65, aspectRatio: homeRatio }}
      resizeMode="contain"
    />
  </View>
      
            {/* 1️⃣ Hero */}
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Find a Contractor for any kind of task</Text>

        {isAuthenticated && (
          <TextInput
            placeholder="Search for a trade"
            placeholderTextColor="#666"
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
          />
        )}

        {query.length > 0 ? (
          loading ? (
            <ActivityIndicator size="large" color={COLOR.primary} style={{ marginTop: 40 }} />
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : shown.length > 0 ? (
            <FlatList
              data={shown}
              keyExtractor={item => item.id}
              numColumns={2}
              columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 16 }}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />
          ) : (
            <Text style={styles.noMatchText}>No such trade found.</Text>
          )
        ) : (
          <Image
            source={COLLAGE_SRC}
            style={{ width: '90%', aspectRatio: collageRatio, maxHeight: MAX_COLLAGE_HEIGHT, borderRadius: 8 }}
            resizeMode="contain"
          />
        )}
      </View>



{/* Below the Hero section, wrap all advertising, service cards, CTA and partner row so they only render when not searching */}
{query.length === 0 && (
  <>
    {/* 2️⃣ Advert banner – guests only */}
    {!isAuthenticated && (
      <TouchableOpacity onPress={handleBannerPress} activeOpacity={0.8}>
        <Image
          source={require('../assets/adds1.jpeg')}
          style={[styles.adBanner, { width: width * 0.9 }]}
          resizeMode="contain"
        />
      </TouchableOpacity>
    )}

    {/* 3️⃣ Service spotlight cards (expandable) */}
    <ServiceCard
      title="Home Services"
      subtitle="Plumbing, painting & more"
      img={require('../assets/home.png')}
      expanded={expandedService === 'home'}
      detailText={SERVICE_INFO.home}
      onPress={() => toggle('home')}
      onBadgePress={() => nav.navigate('Scan')}
    />

    <ServiceCard
      title="Vehicle Services"
      subtitle="Upload photo, AI spots damage"
      img={require('../assets/vehicle.png')}
      expanded={expandedService === 'vehicle'}
      detailText={SERVICE_INFO.vehicle}
      onPress={() => toggle('vehicle')}
      onBadgePress={() => nav.navigate('Scan')}
    />

    <ServiceCard
      title="Emergency Aid"
      subtitle="Get or donate supplies"
      img={require('../assets/aid.png')}
      expanded={expandedService === 'aid'}
      detailText={SERVICE_INFO.aid}
      onPress={() => toggle('aid')}
    />

    {/* 4️⃣ Learn‑more CTA */}
    <TouchableOpacity
      style={styles.moreBtn}
      onPress={() => nav.navigate('Services')}
    >
      <Text style={styles.moreTxt}>Learn More</Text>
    </TouchableOpacity>

    {/* 5️⃣ Partner row – guests only */}
    {!isAuthenticated && (
      <View
        style={styles.partnerRow}
        onLayout={e => setPartnerY(e.nativeEvent.layout.y)}
      >
        {/* 1️⃣ Register as User */}
        <TouchableOpacity
          style={[styles.partnerCard, highlight && styles.partnerCardActive]}
          onPress={() => nav.navigate('SignUp')}
        >
          <Image
            source={require('../assets/login.png')}
            style={styles.partnerImg}
            resizeMode="contain"
          />
          <Text style={[styles.partnerTxt, highlight && styles.partnerTxtActive]}>
            Register as Normal User
          </Text>
        </TouchableOpacity>

        {/* 2️⃣ Register as Contractor */}
        <TouchableOpacity
          style={[styles.partnerCard, highlight && styles.partnerCardActive]}
          onPress={() => nav.navigate('SignUpContractor')}
        >
          <Image
            source={require('../assets/contractor.png')}
            style={styles.partnerImg}
            resizeMode="contain"
          />
          <Text style={[styles.partnerTxt, highlight && styles.partnerTxtActive]}>
            Register as Contractor
          </Text>
        </TouchableOpacity>
      </View>
    )}
  </>
)}

        {/* 3️⃣ Register as Supplier
        <TouchableOpacity
          style={[styles.partnerCard, highlight && styles.partnerCardActive]}
          onPress={() => {
            if (!isAuthenticated) {
              Alert.alert(
                'Authentication required',
                'You must first sign up as a user or contractor before becoming a supplier.'
              );
            } else {
              nav.navigate('Supplier');
            }
          }}
        >
          <Image
            source={require('../assets/supplier.png')}
            style={styles.partnerImg}
            resizeMode="contain"
          />
          <Text style={[styles.partnerTxt, highlight && styles.partnerTxtActive]}>
            Register as Supplier
          </Text>
        </TouchableOpacity> */}
      {/* </View>
    )}                                                               */}





                 {/* 6️⃣ Logo */}
      <View style={{ alignItems: 'center', paddingBottom: insets.bottom + BOTTOM_GAP }}>
        <Logo />
      </View>
    
  
         </ScrollView>
 
    </View> 
  );
}

/* ------------------------------------------------------------------
 * Styles
 * ---------------------------------------------------------------- */
const styles = StyleSheet.create({
  scroll: { flex: 1, width: '100%' },
    bannerBox: {
    alignItems: 'center',
    marginTop: 55,
    marginBottom: 80,
  },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    backgroundColor: COLOR.canvas,
    paddingTop: 32,
  },
  hero: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 28,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLOR.primary,
    textAlign: 'center',
    marginBottom: 14,
  },
  searchBar: {
    width: '80%',
    maxWidth: 340,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: COLOR.white,
    shadowColor: COLOR.primary,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
    marginBottom: 20,
  },
  searchPlaceholder: { color: '#666' },

  collage: { borderRadius: 8 },
  adBanner: {
    aspectRatio: 1.5,
    borderRadius: 8,
    marginBottom: 32,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '90%',
    maxWidth: 600,
    backgroundColor: COLOR.white,
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: COLOR.primary,
  },
  cardExpanded: { paddingBottom: 24 },
  cardImg: { width: 60, height: 60, borderRadius: 10, marginRight: 14 },
  cardTitle: { color: COLOR.primary, fontSize: 16, fontWeight: 'bold' },
  cardSub: { color: COLOR.primary, fontSize: 12, marginTop: 2 },
  cardBadge: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: COLOR.primary,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  cardBadgeTxt: { color: COLOR.white, fontSize: 11, fontWeight: 'bold' },
  detailText: { color: COLOR.primary, fontSize: 14, marginTop: 10, lineHeight: 20 },
  chevron: { color: COLOR.primary, fontSize: 18, marginLeft: 8, fontWeight: 'bold' },
    searchInput: {
    width: '80%',
    maxWidth: 340,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: COLOR.white,
    shadowColor: COLOR.primary,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
    marginBottom: 20,
    fontSize: 14,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  noMatchText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#666',
  },
  tile: {
    backgroundColor: COLOR.white,
    borderRadius: 10,
    alignItems: 'center',
    padding: 12,
    elevation: 2,
  },
  icon: {
    width: 32,
    height: 32,
    
  },
  label: {
    textAlign: 'center',
    color: COLOR.primary,
    fontSize: 13,
  },
  moreBtn: {
    width: '90%',
    maxWidth: 600,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: COLOR.primary,
    alignItems: 'center',
    marginBottom: 40,
  },
  moreTxt: { color: COLOR.white, fontWeight: 'bold' },
  partnerRow: {
    flexDirection: 'row',
    width: '90%',
    maxWidth: 600,
    gap: 12,
    marginBottom: 32,
  },
  partnerCard: {
    flex: 1,
    backgroundColor: COLOR.white,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLOR.primary,
    alignItems: 'center',
    paddingVertical: 22,
  },
  partnerImg: { width: 50, height: 50, marginBottom: 10 },
  partnerTxt: { color: COLOR.primary, textAlign: 'center', fontWeight: 'bold' },
  partnerCardActive: { backgroundColor: COLOR.primary, borderColor: COLOR.canvas },
  partnerTxtActive: { color: COLOR.white },
page: { flex: 1, backgroundColor: COLOR.canvas },
});

