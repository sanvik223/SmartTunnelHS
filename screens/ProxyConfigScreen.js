// screens/ProxyConfigScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';

export default function ProxyConfigScreen() {
  const [ip, setIP] = useState('');
  const [port, setPort] = useState('');

  const connectProxy = () => {
    if (!ip || !port) {
      Alert.alert("Error", "Please enter IP and Port.");
      return;
    }

    // ভবিষ্যতে এখান থেকে VPNService / Proxy শুরু হবে
    Alert.alert("🔗 Proxy Setup", `IP: ${ip}\nPort: ${port}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>⚙️ Proxy Configuration</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter Host IP"
        value={ip}
        onChangeText={setIP}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter Port"
        value={port}
        keyboardType="numeric"
        onChangeText={setPort}
      />

      <TouchableOpacity style={styles.button} onPress={connectProxy}>
        <Text style={styles.buttonText}>🔗 Connect</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 16, backgroundColor: '#fff' },
  heading: { fontSize: 24, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15
  },
  button: {
    backgroundColor: '#3F51B5',
    padding: 14,
    borderRadius: 8
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16
  }
});
