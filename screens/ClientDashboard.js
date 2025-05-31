// screens/ClientDashboard.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { getAuth } from 'firebase/auth';
import { ref, set, onValue } from 'firebase/database';
import { database } from '../firebaseConfig';
import { useNavigation } from '@react-navigation/native';

export default function ClientDashboard() {
  const [hostId, setHostId] = useState('');
  const [hostIP, setHostIP] = useState('');
  const [hostPort, setHostPort] = useState('');
  const [status, setStatus] = useState('❌ Not Connected');

  const user = getAuth().currentUser;
  const navigation = useNavigation();

  const sendConnectionRequest = () => {
    if (!hostId || !hostIP || !hostPort) {
      Alert.alert('⚠️ Missing Info', 'Please enter Host ID, IP, and Port.');
      return;
    }

    const requestData = {
      clientId: user.uid,
      email: user.email,
      hostIP,
      hostPort,
      approved: false
    };

    set(ref(database, `requests/${hostId}/${user.uid}`), requestData)
      .then(() => {
        Alert.alert('✅ Sent', 'Request sent to Host. Please wait for approval.');
      })
      .catch((error) => {
        Alert.alert('❌ Error', error.message);
      });
  };

  useEffect(() => {
    if (!hostId || !user) return;

    const statusRef = ref(database, `connections/${hostId}/${user.uid}`);
    const unsubscribe = onValue(statusRef, snapshot => {
      const data = snapshot.val();
      if (data?.approved) {
        setStatus('✅ Connected');
      } else {
        setStatus('⌛ Pending or ❌ Rejected');
      }
    });

    return () => unsubscribe();
  }, [hostId]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🌐 Connect to Host</Text>

      <TextInput
        placeholder="Host ID"
        style={styles.input}
        value={hostId}
        onChangeText={setHostId}
      />
      <TextInput
        placeholder="Host IP"
        style={styles.input}
        value={hostIP}
        onChangeText={setHostIP}
      />
      <TextInput
        placeholder="Host Port"
        style={styles.input}
        value={hostPort}
        onChangeText={setHostPort}
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.button} onPress={sendConnectionRequest}>
        <Text style={styles.buttonText}>🔗 Request Access</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate("ClientQRScanner")}
        style={styles.qrButton}
      >
        <Text style={styles.qrText}>📷 Scan QR Code</Text>
      </TouchableOpacity>

      <Text style={styles.status}>Status: {status}</Text>

      <TouchableOpacity
        onPress={() => navigation.navigate("ProxyConfig")}
        style={styles.proxyButton}
      >
        <Text style={styles.qrText}>⚙️ Configure Proxy</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ccc'
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    marginTop: 10
  },
  buttonText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
  qrButton: {
    backgroundColor: '#009688',
    padding: 12,
    borderRadius: 8,
    marginTop: 20
  },
  proxyButton: {
    backgroundColor: '#607D8B',
    padding: 12,
    borderRadius: 8,
    marginTop: 20
  },
  qrText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  status: { marginTop: 20, textAlign: 'center', fontSize: 16, color: '#333' }
});
