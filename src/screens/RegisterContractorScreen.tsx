import React, { useEffect,useState } from 'react';
import {
  KeyboardAvoidingView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
//import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';


type Category = { id: string; name: string };
const categories: Category[] = [
  { id: '7', name: 'AC Repair' },
  { id: '8', name: 'Carpentry' },
  { id: '6', name: 'Cleaning' },
  { id: '4', name: 'Electrical' },
  { id: '11', name: 'Glass work' },
  { id: '5', name: 'Painting' },
  { id: '1', name: 'Pest Control' },
  { id: '3', name: 'Plumbing' },
  { id: '10', name: 'Roofing' },
  { id: '12', name: 'Security Systems' },
  { id: '13', name: 'Mechanist' },
  { id: 'other', name: 'Other' },
];

export default function RegisterContractorScreen() {
  const nav = useNavigation<any>();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [otherCategory, setOtherCategory] = useState('');
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState(0);
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string[] }>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');

const clearErrors = () => setErrors({});

const validateInputs = (): boolean => {
  const newErrors: { [key: string]: string[] } = {};

  if (!fullName.trim())               newErrors.name   = ['Full name is required'];
  if (!email.trim()) {
    newErrors.email = ['Email is required'];
  } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    newErrors.email = ['Invalid email'];
  }

  if (!password) {
    newErrors.password = ['Password is required'];
  } else {
    if (password.length < 6) {
      newErrors.password = ['Password must be at least 6 characters'];
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password = ['Password must include at least one uppercase letter'];
    } else if (!/[0-9]/.test(password)) {
      newErrors.password = ['Password must include at least one number'];
    }
  }

  if (password !== confirmPassword) {
    newErrors.password_confirmation = ['Passwords do not match'];
  }

  if (selectedCategories.length === 0) {
    newErrors.service_categories = ['Select at least one category'];
  }

  if (!location.trim())               newErrors.location = ['Location is required'];

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;  // true ⇢ no errors
};

  useEffect(() => {
    fetchCategories();
  }, []);
  const fetchCategories = async () => {
    try {
      const [vehicleRes, buildingRes] = await Promise.all([
        fetch('http://20.174.11.55/api/services/vehicle'),
        fetch('http://20.174.11.55/api/services/building'),
      ]);

      const vehicleData = await vehicleRes.json();
      const buildingData = await buildingRes.json();

      const vehicleCategories: Category[] = vehicleData.map((item: any) => ({
        id: `${item.id+1000}`, // prefix to avoid ID collision
        name: item.service_name,
      }));

      const buildingCategories: Category[] = buildingData.map((item: any) => ({
        id: `${item.id}`, // prefix to avoid ID collision
        name: item.service_name,
      }));

      const combined = [...vehicleCategories, ...buildingCategories, { id: 'other', name: 'Other' }];
      setCategories(combined);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };
  const toggleCategory = (id: string) =>
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
const selectedCategoryNames = selectedCategories
  .map(id => {
    if (id === 'other') return otherCategory.trim();          // champ libre
    const cat = categories.find(c => c.id === id);
    return cat?.name;                                         // libellé « Plumbing », « Electrical », etc.
  })
  .filter(Boolean);    
 const handleSubmit = async () => {
  clearErrors();
if (!validateInputs()) return;
// {errors.password_confirmation && (
//   <Text style={styles.error}>{errors.password_confirmation[0]}</Text>
// )}
  // ── Validation rapide côté client ──────────────────────────────────────────
  // if (!fullName || !email || !password) {
  //   return Alert.alert('Erreur', 'Nom, e-mail et mot de passe sont requis.');
  // }
  // if (password !== confirmPassword) {
  //   return Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
  // }
 
  // ── Construction du payload ───────────────────────────────────────────────
  const payload = {
    name: fullName,
    email,
    password,
    password_confirmation: confirmPassword,
    phone_number: phone,
    service_categories: selectedCategoryNames,   // ex. ["Plumbing","Electrical"]
    location:location,                                    // « Beirut » ou adresse Google Places
    years_of_experience: experience,             // nombre entier
    description,
  };
 
try {
  const res = await fetch('http://20.174.11.55/api/contractor/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
    body: JSON.stringify(payload),
  });
 
const data = await res.json();         
setErrors({});
// Type assertion to avoid 'unknown' error
const errorData = data as { errors?: Record<string, string[]>; message?: string };

if (!res.ok) {                         // Status ≥ 400, dont 422
  console.log('Validation errors →', errorData.errors);   // ⚡️ journalisez-les
  // Affichez la 1ʳᵉ erreur à l’utilisateur (facultatif)
  const first =
    errorData?.errors && Object.values(errorData.errors)[0][0];
    setErrors(errorData.errors || {});
  return Alert.alert('Erreur', first || errorData.message);
}
 
  Alert.alert('successfull !');
  nav.navigate('Login');
} catch (e) {
  console.error(e);
  setErrors({ general: ['Impossible de joindre le serveur'] });
  Alert.alert('Erreur réseau', "Impossible de joindre le serveur");
}
};
  return (
    <KeyboardAvoidingView
      style={styles.page}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        {/* Back arrow outside the card */}
        <TouchableOpacity onPress={() => nav.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#3E575D" />
        </TouchableOpacity>

        {/* Icon outside card */}
        <Image
          source={require('../assets/contractor.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <View style={styles.card}>
          <Text style={styles.title}>Register as Contractor</Text>

          {errors.general && (
            <Text style={styles.errorAbove}>{errors.general[0]}</Text>
          )}

          {/* Full Name */}
          <View style={styles.inputWrapper}>
            {errors.name && (
              <Text style={styles.errorAbove}>{errors.name[0]}</Text>
            )}
            <TextInput
              placeholder="Full Name * "
              value={fullName}
              onChangeText={setFullName}
              style={[styles.input, errors.name && styles.inputError]}
            />
          </View>

          {/* Email */}
          <View style={styles.inputWrapper}>
            {errors.email && (
              <Text style={styles.errorAbove}>{errors.email[0]}</Text>
            )}
            <TextInput
              placeholder="Email * "
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              style={[styles.input, errors.email && styles.inputError]}
            />
          </View>

          {/* Phone Number */}
          <View style={styles.inputWrapper}>
            {errors.phone_number && (
              <Text style={styles.errorAbove}>{errors.phone_number[0]}</Text>
            )}
            <TextInput
              placeholder="Phone Number * "
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              style={[styles.input, errors.phone_number && styles.inputError]}
            />
          </View>

          {/* Password */}
          <View style={styles.inputWrapper}>
            {errors.password && (
              <Text style={styles.errorAbove}>{errors.password[0]}</Text>
            )}
            <TextInput
              placeholder="Password * "
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={[styles.input, errors.password && styles.inputError]}
            />
          </View>

          {/* Confirm Password */}
          <View style={styles.inputWrapper}>
            {errors.password_confirmation && (
              <Text style={styles.errorAbove}>{errors.password_confirmation[0]}</Text>
            )}
            <TextInput
              placeholder="Confirm Password * "
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              style={[styles.input, errors.password_confirmation && styles.inputError]}
            />
          </View>
        

        {/* Service Categories */}
        <View style={styles.inputWrapper}>
          {errors.service_categories && (
            <Text style={styles.errorAbove}>{errors.service_categories[0]}</Text>
          )}

          <Text style={styles.label}>Service Categories * </Text>

          <View style={styles.categoryContainer}>
            {categories
              .filter(cat => cat.id !== 'other')
              .map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => toggleCategory(cat.id)}
                  style={[
                    styles.categoryItem,
                    selectedCategories.includes(cat.id) && styles.categoryItemSelected,
                  ]}
                >
                  <Text
                    style={
                      selectedCategories.includes(cat.id)
                        ? styles.categoryTextSelected
                        : styles.categoryText
                    }
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
          </View>
        </View>



        {/* Location */}
        <View style={styles.inputWrapper}>
          {errors.location && (
            <Text style={styles.errorAbove}>{errors.location[0]}</Text>
          )}
          <TextInput
            placeholder="Location * "
            value={location}
            onChangeText={setLocation}
            multiline
            style={[
              styles.input,
              styles.textArea,
              errors.location && styles.inputError,
            ]}
          />
        </View>

          <Text style={styles.label}>Years of Experience</Text>
          <View style={styles.experienceRow}>
            <TouchableOpacity onPress={() => setExperience(e => Math.max(e - 1, 0))} style={styles.expBtn}>
              <Ionicons name="remove-circle-outline" size={32} color="#3E575D" />
            </TouchableOpacity>
            <Text style={styles.expText}>{experience}</Text>
            <TouchableOpacity onPress={() => setExperience(e => e + 1)} style={styles.expBtn}>
              <Ionicons name="add-circle-outline" size={32} color="#3E575D" />
            </TouchableOpacity>
          </View>

          <TextInput placeholder="Brief Description" value={description} onChangeText={setDescription} multiline style={[styles.input, styles.textArea]} />
          </View>
          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Create Account</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.link} onPress={() => nav.navigate('Login')}>
            <Text style={styles.linkText}>Already have an account? <Text style={styles.linkBold}>Log In</Text></Text>
          </TouchableOpacity>
        
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#FAF9F6' },
  inner: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  backBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 16,
    zIndex: 1,
  },
  logo: { width: 80, height: 80, marginBottom: 20 },
  card: { width: '100%', maxWidth: 360, backgroundColor: '#fff', borderRadius: 12, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 4 },
  title: { fontSize: 22, fontWeight: '600', color: '#3E575D', textAlign: 'center', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#868686', borderRadius: 8, padding: 12, marginBottom: 16, backgroundColor: '#FFFFFF' },
  label: { fontSize: 16, fontWeight: '600', color: '#3E575D', marginBottom: 8 },
  categoryContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
  categoryItem: { borderWidth: 1, borderColor: '#868686', borderRadius: 20, paddingVertical: 6, paddingHorizontal: 12, margin: 4 },
  categoryItemSelected: { backgroundColor: '#3E575D', borderColor: '#3E575D' },
  categoryText: { color: '#868686' },
  categoryTextSelected: { color: '#FFFFFF' },
  placesList: { backgroundColor: '#FFF', maxHeight: 200, marginBottom: 16 },
  experienceRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  expBtn: { paddingHorizontal: 8 },
  expText: { marginHorizontal: 20, fontSize: 16, color: '#3E575D' },
  textArea: { height: 100, textAlignVertical: 'top', marginBottom: 16 },
  button: { backgroundColor: '#3E575D', marginTop: 24, borderRadius: 8, padding: 15, alignItems: 'center', marginBottom: 16 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  link: { alignItems: 'center', marginBottom: 0 },
  linkText: { color: '#3E575D', fontSize: 14 },
  linkBold: { fontWeight: 'bold', textDecorationLine: 'underline' },
  error: { color: 'red', marginBottom: 8 },
  inputWrapper: { marginBottom: 16 },
  inputError:  { borderColor: 'red' },
  errorAbove:  { color: 'red', marginBottom: 4 },
});
