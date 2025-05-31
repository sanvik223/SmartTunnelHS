// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import RegisterScreen from './screens/RegisterScreen';
import LoginScreen from './screens/LoginScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import HostDashboard from './screens/HostDashboard';
import ClientDashboard from './screens/ClientDashboard';
import ProxyConfigScreen from './screens/ProxyConfigScreen';
import ClientQRScannerScreen from './screens/ClientQRScannerScreen';
import HostQRCodeScreen from './screens/HostQRCodeScreen';
import ClientControl from './screens/ClientControl';

import './firebaseConfig';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="HostDashboard" component={HostDashboard} />
        <Stack.Screen name="ClientDashboard" component={ClientDashboard} />
        <Stack.Screen name="ProxyConfig" component={ProxyConfigScreen} />
        <Stack.Screen name="ClientQRScanner" component={ClientQRScannerScreen} />
        <Stack.Screen name="HostQR" component={HostQRCodeScreen} />
        <Stack.Screen name="ClientControl" component={ClientControl} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
