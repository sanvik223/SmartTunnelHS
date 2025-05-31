// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import RegisterScreen from './screens/RegisterScreen';
import LoginScreen from './screens/LoginScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import HostDashboard from './screens/HostDashboard';
import ClientDashboard from './screens/ClientDashboard';
import ProxyConfigScreen from './screens/ProxyConfigScreen';
import HostQRCodeScreen from './screens/HostQRCodeScreen';
import ClientQRScannerScreen from './screens/ClientQRScannerScreen';
import ClientControl from './screens/ClientControl';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="HostDashboard" component={HostDashboard} />
        <Stack.Screen name="ClientDashboard" component={ClientDashboard} />
        <Stack.Screen name="ProxyConfig" component={ProxyConfigScreen} />
        <Stack.Screen name="HostQR" component={HostQRCodeScreen} />
        <Stack.Screen name="ClientQRScanner" component={ClientQRScannerScreen} />
        <Stack.Screen name="ClientControl" component={ClientControl} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
