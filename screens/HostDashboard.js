// screens/HostDashboard.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { database } from '../firebaseConfig';
import { ref, onValue, update, remove } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';

export default function HostDashboard() {
  const [requests, setRequests] = useState([]);
  const [clients, setClients] = useState([]);
  const userId = getAuth().currentUser.uid;
  const navigation = useNavigation();

  useEffect(() => {
    const reqRef = ref(database, `requests/${userId}`);
    const connRef = ref(database, `connections/${userId}`);

    const unsubscribeReq = onValue(reqRef, snapshot => {
      const data = snapshot.val() || {};
      const reqList = Object.entries(data).map(([key, val]) => ({
        id: key,
        email: val.email
      }));
      setRequests(reqList);
    });

    const unsubscribeCon = onValue(connRef, snapshot => {
      const data = snapshot.val() || {};
      const conList = Object.entries(data).map(([key, val]) => ({
        id: key,
        email: val.email
      }));
      setClients(conList);
    });

    return () => {
      unsubscribeReq();
      unsubscribeCon();
    };
  }, []);

  const acceptRequest = (clientId, email) => {
    update(ref(database, `connections/${userId}/${clientId}`), {
      approved: true,
      connectedAt: Date.now(),
      email: email
    });
    remove(ref(database, `requests/${userId}/${clientId}`));
    Alert.alert('✅ Accepted', 'Client approved.');
  };

  const rejectRequest = (clientId) => {
    remove(ref(database, `requests/${userId}/${clientId}`));
    Alert.alert('❌ Rejected', 'Client request removed.');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>👥 Connected Clients</Text>
      <FlatList
        data={clients}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>🟢 {item.email}</Text>
          </View>
        )}
      />

      <Text style={styles.heading}>📥 Pending Requests</Text>
      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>🔵 {item.email}</Text>
            <View style={styles.buttons}>
              <TouchableOpacity style={styles.accept} onPress={() => acceptRequest(item.id, item.email)}>
                <Text style={styles.btnText}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.reject} onPress={() => rejectRequest(item.id)}>
                <Text style={styles.btnText}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <TouchableOpacity
        style={styles.qrButton}
        onPress={() => navigation.navigate("HostQR")}
      >
        <Text style={styles.qrButtonText}>📤 Show QR</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          Alert.alert(
            'Start Server Manually',
            'Please run the server.js file using Termux manually.\n\nCommand:\nnode server.js',
            [{ text: 'OK' }]
          );
        }}
        style={{
          backgroundColor: '#3F51B5',
          padding: 12,
          borderRadius: 8,
          marginVertical: 10
        }}
      >
        <Text style={{ color: '#fff', textAlign: 'center' }}>🧩 Start Proxy Server</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          backgroundColor: '#795548',
          padding: 10,
          borderRadius: 8,
          marginTop: 10
        }}
        onPress={() => navigation.navigate("ClientControl")}
      >
        <Text style={{ color: '#fff', textAlign: 'center' }}>🛠 Manage Clients</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  heading: { fontSize: 20, fontWeight: 'bold', marginTop: 20 },
  item: { padding: 10, marginVertical: 5, backgroundColor: '#f0f0f0', borderRadius: 8 },
  buttons: { flexDirection: 'row', marginTop: 5, gap: 10 },
  accept: { backgroundColor: '#4CAF50', padding: 8, borderRadius: 6, marginRight: 10 },
  reject: { backgroundColor: '#F44336', padding: 8, borderRadius: 6 },
  btnText: { color: '#fff', fontWeight: 'bold' },
  qrButton: { backgroundColor: '#2196F3', padding: 12, borderRadius: 8, marginTop: 20 },
  qrButtonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' }
});
