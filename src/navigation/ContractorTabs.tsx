// NEW FILE — ContractorTabs.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import ContractorHome from '../screens/ContractorHome';
import MySupplier      from '../screens/MySupplier';
import MoreStack       from './MoreStack';

const Tab = createBottomTabNavigator();

export default function ContractorTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#3E575D',
        tabBarInactiveTintColor: '#868686',
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        tabBarStyle: { backgroundColor: '#FFFFFF', height: 60, paddingBottom: 6 },
        tabBarIcon: ({ focused, color, size }) => {
          switch (route.name) {
            case 'Home':
              return <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />;
            case "I'm a Supplier":
              return <Ionicons name={focused ? 'storefront' : 'storefront-outline'} size={size} color={color} />;
            case 'More':
              return <Ionicons name={focused ? 'menu' : 'menu-outline'} size={size} color={color} />;
            default:
              return null;
          }
        },
      })}
    >
      <Tab.Screen name="Home"           component={ContractorHome} />
      <Tab.Screen name="I'm a Supplier" component={MySupplier}     />
      {/* reuse the existing More stack so nothing else changes */}
      <Tab.Screen name="More"           component={MoreStack}      />
    </Tab.Navigator>
  );
}
