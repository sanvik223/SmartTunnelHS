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
        Alert.alert("✅ Scanned", `Host ID: ${data.hostId}`);

        navigation.navigate("ClientDashboard", {
          scannedHostId: data.hostId,
          scannedIP: data.hostIP,
          scannedPort: data.hostPort
        });
      } else {
        Alert.alert("Invalid QR", "Scanned data is not valid.");
      }
    } catch (error) {
      Alert.alert("Scan Failed", "Could not read QR data.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📷 Scan Host QR Code</Text>
      <QRCodeScanner
        onRead={onSuccess}
        showMarker={true}
        reactivate={true}
        topContent={<Text style={styles.info}>Align QR within frame</Text>}
        bottomContent={null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 20, textAlign: 'center', marginTop: 20 },
  info: { textAlign: 'center', marginTop: 10, color: 'gray' }
});
