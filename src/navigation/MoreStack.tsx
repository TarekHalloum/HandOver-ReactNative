// src/navigation/MoreStack.tsx
// HandOver ▸ More tab nested stack (with MyRequests, MyScans, Profile, etc.)
// -----------------------------------------------------------------------------
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MoreScreen from '../screens/MoreScreen';
import HelpScreen from '../screens/Help';
import ContactScreen from '../screens/Contact';
import MySupplierScreen from '../screens/MySupplier';
import CareerScreen from '../screens/CareerScreen';
import PrivacyScreen from '../screens/PrivacyScreen';
import TermsScreen from '../screens/TermsScreen';
import MyRequestsScreen from '../screens/MyRequestsScreen';
import ScanScreen from '../screens/ScanScreen';
import MyScansScreen from '../screens/MyScansScreen';
import ProfileScreen from '../screens/ProfileScreen';

export type MoreStackParamList = {
  MoreHome: undefined;
  MyRequests: { serviceId?: string; serviceName?: string };
  Scan: undefined;
  MyScans: undefined;
  Profile: undefined;
  Help: undefined;
  Contact: undefined;
  MySupplier: undefined;
  CareerScreen: undefined;
  PrivacyScreen: undefined;
  TermsScreen: undefined;
};

const Stack = createNativeStackNavigator<MoreStackParamList>();

export default function MoreStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Root More menu */}
      <Stack.Screen name="MoreHome" component={MoreScreen} options={{ title: 'More' }} />

      {/* My Requests screen */}
      <Stack.Screen name="MyRequests" component={MyRequestsScreen} options={{ title: 'My Requests' }} />

      {/* scan screen */}
      <Stack.Screen name="Scan"       component={ScanScreen} />

      {/* My Scans screen */}
      <Stack.Screen name="MyScans" component={MyScansScreen} options={{ title: 'My Scans' }} />

      {/* Profile placeholder */}
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />

      {/* Help, Contact, etc. */}
      <Stack.Screen name="Help" component={HelpScreen} options={{ title: 'Help' }} />
      <Stack.Screen name="Contact" component={ContactScreen} options={{ title: 'Contact Us' }} />
      <Stack.Screen name="MySupplier" component={MySupplierScreen} options={{ title: 'Supplier' }} />
      <Stack.Screen name="CareerScreen" component={CareerScreen} options={{ title: 'Careers' }} />
      <Stack.Screen name="PrivacyScreen" component={PrivacyScreen} options={{ title: 'Privacy Policy' }} />
      <Stack.Screen name="TermsScreen" component={TermsScreen} options={{ title: 'Terms & Conditions' }} />
    </Stack.Navigator>
  );
}
