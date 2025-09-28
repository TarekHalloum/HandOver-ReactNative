// App.tsx
// HandOver ▸ Root application navigator
// -----------------------------------------------------------------------------
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from './src/navigation/types';

// --------------- Entry / Auth screens -----------------------------
import Index             from './src/components/Index';
import Login             from './src/screens/Login';
import SignUp            from './src/screens/SignUp';
import SignUpContractor  from './src/screens/RegisterContractorScreen';

// --------------- Tab‑based flows ----------------------------------
import RootTabs          from './src/navigation/RootTabs';         // user footer
import ContractorTabs    from './src/navigation/ContractorTabs';   // contractor footer

// --------------- Modals / single‑screens --------------------------
import ContractorFeedbackScreen from './src/screens/ContractorFeedbackScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Splash / landing */}
        <Stack.Screen name="Index" component={Index} />

        {/* Authentication */}
        <Stack.Screen name="Login"               component={Login} />
        <Stack.Screen name="SignUp"              component={SignUp} />
        <Stack.Screen name="SignUpContractor"    component={SignUpContractor} />

        {/* Main flows */}
        <Stack.Screen name="RootTabs"            component={RootTabs} />
        <Stack.Screen name="ContractorTabs"      component={ContractorTabs} />

        {/* Contractor quote / feedback modal */}
        <Stack.Screen name="ContractorFeedback"  component={ContractorFeedbackScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}