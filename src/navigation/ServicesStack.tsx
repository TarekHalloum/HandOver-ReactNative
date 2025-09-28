// src/navigation/ServicesStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Image, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import ServicesScreen from '../screens/ServicesScreen';
import HomeCategoryScreen from '../screens/HomeCategoryScreen';
import EmergencyChoiceScreen from '../screens/EmergencyChoiceScreen';
import MySupplier from '../screens/MySupplier';
import EmergencyReceiveScreen from '../screens/EmergencyReceiveScreen';
import VehicleCategoryScreen from '../screens/VehicleCategoryScreen';
import ServiceDetailsScreen from '../screens/ServiceDetailsScreen';
import ServiceDetailsScreen2 from '../screens/ServiceDetailsScreen2';
import ScanScreen from '../screens/ScanScreen'; 
// Navigation props for header buttons
type ServicesStackNavProp = NativeStackNavigationProp<any>;

export type ServicesStackParamList = {
  Services: undefined;
  HomeCategory: undefined;
  Scan        : undefined; 
  EmergencyChoice: undefined;
  EmergencyDonate: undefined;
  EmergencyReceive: undefined;
  VehicleCategory: undefined;
  ServiceDetails: { id: string; name?: string };
  ServiceDetails2: { id: string; name?: string };
  History: undefined;
};

const Stack = createNativeStackNavigator<ServicesStackParamList>();

export default function ServicesStack() {
  const nav = useNavigation<ServicesStackNavProp>();
  const insets = useSafeAreaInsets();

  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      {/* Root screen */}
      <Stack.Screen
        name="Services"
        component={ServicesScreen}
        options={{ headerShown: false }}
      />
      
      <Stack.Screen
        name="Scan"
        component={ScanScreen}
        options={{ headerShown: false }}
      />
      {/* Home Services category with history icon moved into headerRight */}
      <Stack.Screen
        name="HomeCategory"
        component={HomeCategoryScreen}
        options={({ navigation }) => ({
          headerTitle: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image
                source={require('../assets/home.png')}
                style={{ width: 20, height: 20, marginRight: 6 }}
                resizeMode="contain"
              />
              <Text style={{ color: '#3E575D', fontWeight: 'bold', fontSize: 16 }}>
                Home Services
              </Text>
            </View>
          ),
          headerLeftContainerStyle: {
            paddingLeft: insets.left + 16,
          },
          headerRight: () => (
            <TouchableOpacity
              onPress={() => nav.navigate('More', { screen: 'MyRequests' })}
              style={{ paddingHorizontal: 16 , alignItems: 'center'}}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Image
                source={require('../assets/history.png')}
                style={{ width: 20, height: 20 }}
                resizeMode="contain"
              />
               <Text style={{ fontSize: 10, color: '#3E575D', marginTop: 2 }}>
                  History
               </Text>
            </TouchableOpacity>
          ),
          headerRightContainerStyle: {
            paddingRight: insets.right + 16,
          },
        })}
      />

      {/* Emergency Aid choice */}
      <Stack.Screen
        name="EmergencyChoice"
        component={EmergencyChoiceScreen}
        options={({ navigation }) => ({
          headerTitle: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image
                source={require('../assets/aid.png')}
                style={{ width: 20, height: 20, marginRight: 6 }}
                resizeMode="contain"
              />
              <Text style={{ color: '#3E575D', fontWeight: 'bold', fontSize: 16 }}>
                Emergency Aid
              </Text>
            </View>
          ),
          headerLeftContainerStyle: { paddingLeft: insets.left + 16 },
        })}
      />

      {/* Donate flow */}
      <Stack.Screen
        name="EmergencyDonate"
        component={MySupplier}
        options={{ title: 'Donate Supplies' }}
      />

      {/* Receive flow */}
      <Stack.Screen
        name="EmergencyReceive"
        component={EmergencyReceiveScreen}
        options={{ title: 'Request Aid' }}
      />

      {/* Vehicle Services category */}
      <Stack.Screen
        name="VehicleCategory"
        component={VehicleCategoryScreen}
        options={({ navigation }) => ({
          headerTitle: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image
                source={require('../assets/vehicle.png')}
                style={{ width: 20, height: 20, marginRight: 6 }}
                resizeMode="contain"
              />
              <Text style={{ color: '#3E575D', fontWeight: 'bold', fontSize: 16 }}>
                Vehicle Services
              </Text>
            </View>
          ),
      
          headerLeftContainerStyle: { paddingLeft: insets.left + 16 },
                    headerRight: () => (
            <TouchableOpacity
              onPress={() => nav.navigate('More', { screen: 'MyRequests' })}
              style={{ paddingHorizontal: 16 , alignItems: 'center'}}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Image
                source={require('../assets/history.png')}
                style={{ width: 20, height: 20 }}
                resizeMode="contain"
              />
               <Text style={{ fontSize: 10, color: '#3E575D', marginTop: 2 }}>
                  History
               </Text>
            </TouchableOpacity>
          ),
          headerRightContainerStyle: {
            paddingRight: insets.right + 16,
          },
        })}
      />

{/* Service Details screen (shared for Home & Vehicle) */}
<Stack.Screen
  name="ServiceDetails"
  component={ServiceDetailsScreen}
  options={({ navigation, route }) => {
    const { name, fromHome } = (route.params ?? {}) as {
      name?: string;
      fromHome?: boolean;
    };
    return {
      title: name || 'Service Details',
      headerLeft: () => (
        <TouchableOpacity
          onPress={() =>
            fromHome
              ? navigation.getParent()?.navigate('Home')
              : navigation.goBack()
          }
          style={{ paddingHorizontal: 16 }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chevron-back" size={24} color="#3E575D" />
        </TouchableOpacity>
      ),
    };
  }}
/>

<Stack.Screen
  name="ServiceDetails2"
  component={ServiceDetailsScreen2}
  options={({ navigation, route }) => {
    const { name, fromHome } = (route.params ?? {}) as {
      name?: string;
      fromHome?: boolean;
    };
    return {
      title: name || 'Service Details',
      headerLeft: () => (
        <TouchableOpacity
          onPress={() =>
            fromHome
              ? navigation.getParent()?.navigate('Home')
              : navigation.goBack()
          }
          style={{ paddingHorizontal: 16 }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chevron-back" size={24} color="#3E575D" />
        </TouchableOpacity>
      ),
    };
  }}
/>


      {/* Optional: History screen registration */}
      {/*
      <Stack.Screen
        name="History"
        component={HistoryScreen}
        options={{ title: 'My Requests' }}
      />
      */}
    </Stack.Navigator>
  );
}
