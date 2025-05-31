// screens/ProxyConfigScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function ProxyConfigScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const [ip, setIp] = useState(route.params?.scannedIP || '');
  const [port, setPort] = useState(route.params?.scannedPort || '');

  const saveSettings = () => {
    if (!ip || !port) {
      Alert.alert("Error", "IP and Port are required");
      return;
    }

    Alert.alert("Saved", `Proxy configured:\nhttp://${ip}:${port}`);
    navigation.navigate("ClientDashboard");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>⚙️ Proxy Configuration</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter Host IP"
        value={ip}
        onChangeText={setIp}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter Port"
        value={port}
        onChangeText={setPort}
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.button} onPress={saveSettings}>
        <Text style={styles.buttonText}>💾 Save</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  heading: { fontSize: 24, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
  input: { borderWidth: 1, padding: 12, marginBottom: 16, borderRadius: 8 },
  button: { backgroundColor: '#4CAF50', padding: 14, borderRadius: 8 },
  buttonText: { color: '#fff', textAlign: 'center', fontSize: 16 }
});
