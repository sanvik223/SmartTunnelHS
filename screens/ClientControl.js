// screens/ClientControl.js
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { ref, update, onValue } from 'firebase/database';
import { database } from '../firebaseConfig';
import { getAuth } from 'firebase/auth';

export default function ClientControl() {
  const [clients, setClients] = useState([]);
  const userId = getAuth().currentUser.uid;

  useEffect(() => {
    const clientRef = ref(database, `connections/${userId}`);
    const unsubscribe = onValue(clientRef, snapshot => {
      const data = snapshot.val() || {};
      const list = Object.entries(data).map(([key, val]) => ({
        id: key,
        ...val,
      }));
      setClients(list);
    });

    return () => unsubscribe();
  }, []);

  const updateClient = (clientId, changes) => {
    update(ref(database, `connections/${userId}/${clientId}`), changes)
      .then(() => Alert.alert('✅ Updated', 'Client updated successfully'))
      .catch(err => Alert.alert('❌ Error', err.message));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🛠 Manage Clients</Text>
      <FlatList
        data={clients}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.clientCard}>
            <Text style={styles.clientText}>📧 {item.email}</Text>

            <TextInput
              style={styles.input}
              placeholder="MB Limit (e.g. 100)"
              keyboardType="numeric"
              onSubmitEditing={({ nativeEvent }) => updateClient(item.id, {
                mbLimit: parseInt(nativeEvent.text),
                unlimited: false
              })}
            />

            <TouchableOpacity
              style={styles.buttonGreen}
              onPress={() => updateClient(item.id, { unlimited: true })}
            >
              <Text style={styles.buttonText}>🌐 Unlimited Access</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.buttonRed}
              onPress={() => updateClient(item.id, { blocked: true })}
            >
              <Text style={styles.buttonText}>🚫 Block</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.buttonBlue}
              onPress={() => updateClient(item.id, { blocked: false })}
            >
              <Text style={styles.buttonText}>✅ Unblock</Text>
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="Speed (KB/s)"
              keyboardType="numeric"
              onSubmitEditing={({ nativeEvent }) => updateClient(item.id, {
                speedLimit: parseInt(nativeEvent.text)
              })}
            />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  clientCard: { marginBottom: 20, padding: 12, borderRadius: 8, backgroundColor: '#f5f5f5' },
  clientText: { marginBottom: 8, fontWeight: 'bold', fontSize: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 6
  },
  buttonGreen: { backgroundColor: '#4CAF50', padding: 10, borderRadius: 6, marginBottom: 8 },
  buttonRed: { backgroundColor: '#F44336', padding: 10, borderRadius: 6, marginBottom: 8 },
  buttonBlue: { backgroundColor: '#2196F3', padding: 10, borderRadius: 6, marginBottom: 8 },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' }
});
