// screens/ClientControl.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { ref, onValue, update } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { database } from '../firebaseConfig';

export default function ClientControl() {
  const [clients, setClients] = useState([]);
  const auth = getAuth();
  const hostId = auth.currentUser.uid;

  useEffect(() => {
    const requestRef = ref(database, `requests/${hostId}`);
    const unsubscribe = onValue(requestRef, snapshot => {
      const data = snapshot.val();
      if (data) {
        setClients(Object.entries(data));
      } else {
        setClients([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const approveClient = (clientId) => {
    update(ref(database, `requests/${hostId}/${clientId}`), { approved: true });
    update(ref(database, `connections/${hostId}/${clientId}`), {
      approved: true,
      usage: 0,
      unlimited: false,
      blocked: false,
      speed: '1mbps'
    });
    Alert.alert('✅ Approved', `Client ${clientId} approved.`);
  };

  const toggleBlock = (clientId, blocked) => {
    update(ref(database, `connections/${hostId}/${clientId}`), { blocked: !blocked });
  };

  const toggleUnlimited = (clientId, unlimited) => {
    update(ref(database, `connections/${hostId}/${clientId}`), { unlimited: !unlimited });
  };

  const changeSpeed = (clientId, speed) => {
    update(ref(database, `connections/${hostId}/${clientId}`), { speed });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>👥 Connected Clients</Text>
      {clients.length === 0 ? (
        <Text style={styles.noClients}>No connection requests yet.</Text>
      ) : (
        clients.map(([clientId, client]) => (
          <View key={clientId} style={styles.card}>
            <Text style={styles.label}>📧 {client.email}</Text>
            <Text>ID: {clientId}</Text>
            <Text>IP: {client.hostIP}</Text>
            <Text>Port: {client.hostPort}</Text>

            <TouchableOpacity
              style={styles.approveBtn}
              onPress={() => approveClient(clientId)}
              disabled={client.approved}
            >
              <Text style={styles.btnText}>{client.approved ? '✅ Approved' : '✔️ Approve'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.blockBtn}
              onPress={() => toggleBlock(clientId, client.blocked)}
            >
              <Text style={styles.btnText}>{client.blocked ? '🟢 Unblock' : '🔴 Block'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.unlimitedBtn}
              onPress={() => toggleUnlimited(clientId, client.unlimited)}
            >
              <Text style={styles.btnText}>{client.unlimited ? '🚫 Limit MB' : '♾️ Unlimited'}</Text>
            </TouchableOpacity>

            <View style={styles.speedOptions}>
              <TouchableOpacity onPress={() => changeSpeed(clientId, '1mbps')}>
                <Text style={styles.speedText}>1Mbps</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => changeSpeed(clientId, '2mbps')}>
                <Text style={styles.speedText}>2Mbps</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => changeSpeed(clientId, '5mbps')}>
                <Text style={styles.speedText}>5Mbps</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#f0f0f0' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  noClients: { textAlign: 'center', marginTop: 40, fontSize: 16, color: '#888' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    elevation: 3
  },
  label: { fontWeight: 'bold', marginBottom: 5 },
  approveBtn: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 8,
    marginTop: 10
  },
  blockBtn: {
    backgroundColor: '#f44336',
    padding: 10,
    borderRadius: 8,
    marginTop: 10
  },
  unlimitedBtn: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 8,
    marginTop: 10
  },
  btnText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  speedOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10
  },
  speedText: {
    backgroundColor: '#9C27B0',
    color: '#fff',
    padding: 8,
    borderRadius: 6,
    textAlign: 'center',
    fontWeight: 'bold'
  }
});
