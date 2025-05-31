// screens/ClientQRScannerScreen.js
import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { useNavigation } from '@react-navigation/native';

export default function ClientQRScannerScreen() {
  const navigation = useNavigation();

  const onSuccess = (e) => {
    try {
      const data = JSON.parse(e.data);
      if (data.hostId && data.hostIP && data.hostPort) {
        Alert.alert("Scanned!", `Host: ${data.hostId}`);
        navigation.navigate("ClientDashboard", {
          scannedHostId: data.hostId,
          scannedIP: data.hostIP,
          scannedPort: data.hostPort
        });
      } else {
        Alert.alert("Invalid QR", "Scanned data is not valid.");
      }
    } catch (error) {
      Alert.alert("Scan Failed", "Could not parse QR data.");
    }
  };

  return (
    <View style={styles.container}>
      <QRCodeScanner onRead={onSuccess} showMarker={true} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 }
});
