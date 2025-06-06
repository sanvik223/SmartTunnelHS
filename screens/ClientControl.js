// screens/ClientControl.js
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import { ref, onValue, update } from 'firebase/database';
import { database } from '../firebaseConfig';
import { getAuth } from 'firebase/auth';

export default function ClientControl() {
  const [clients, setClients] = useState([]);
  const user = getAuth().currentUser;
  const userId = user?.uid;

  useEffect(() => {
    if (!userId) return;

    const connRef = ref(database, `connections/${userId}`);
    const unsubscribe = onValue(connRef, snapshot => {
      const data = snapshot.val() || {};
      const clientList = Object.entries(data).map(([id, val]) => ({
        id,
        email: val.email || id,
        mbLimit: val.mbLimit || '',
        unlimited: val.unlimited || false,
        blocked: val.blocked || false,
        speed: val.speed || ''
      }));
      setClients(clientList);
    });

    return () => unsubscribe();
  }, [userId]);

  const handleUpdate = (client) => {
    const updates = {
      mbLimit: parseFloat(client.mbLimit),
      unlimited: client.unlimited,
      blocked: client.blocked,
      speed: parseInt(client.speed)
    };
    update(ref(database, `connections/${userId}/${client.id}`), updates)
      .then(() => Alert.alert("✅ Updated", `${client.email} settings saved.`))
      .catch(() => Alert.alert("❌ Error", "Failed to update client."));
  };

  const toggle = (client, field) => {
    setClients(prev => prev.map(c => (
      c.id === client.id ? { ...c, [field]: !client[field] } : c
    )));
  };

  const updateField = (client, field, value) => {
    setClients(prev => prev.map(c => (
      c.id === client.id ? { ...c, [field]: value } : c
    )));
  };

  return (
    <FlatList
      contentContainerStyle={styles.container}
      data={clients}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.email}>{item.email}</Text>

          <TextInput
            style={styles.input}
            placeholder="MB Limit"
            keyboardType="numeric"
            value={item.mbLimit.toString()}
            onChangeText={(text) => updateField(item, 'mbLimit', text)}
          />

          <TextInput
            style={styles.input}
            placeholder="Speed (kbps)"
            keyboardType="numeric"
            value={item.speed.toString()}
            onChangeText={(text) => updateField(item, 'speed', text)}
          />

          <View style={styles.switchRow}>
            <TouchableOpacity
              style={[styles.switchBtn, item.unlimited && styles.activeBtn]}
              onPress={() => toggle(item, 'unlimited')}
            >
              <Text style={styles.switchText}>Unlimited</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.switchBtn, item.blocked && styles.blockedBtn]}
              onPress={() => toggle(item, 'blocked')}
            >
              <Text style={styles.switchText}>Block</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.saveBtn}
            onPress={() => handleUpdate(item)}
          >
            <Text style={styles.saveText}>💾 Save</Text>
          </TouchableOpacity>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff' },
  card: { backgroundColor: '#f0f0f0', padding: 16, borderRadius: 10, marginBottom: 15 },
  email: { fontWeight: 'bold', fontSize: 16, marginBottom: 8 },
  input: {
    backgroundColor: '#fff', padding: 8, borderRadius: 6,
    borderWidth: 1, borderColor: '#ccc', marginBottom: 10
  },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  switchBtn: {
    flex: 1, marginRight: 10, padding: 10, borderRadius: 6,
    backgroundColor: '#ddd', alignItems: 'center'
  },
  activeBtn: { backgroundColor: '#4CAF50' },
  blockedBtn: { backgroundColor: '#F44336' },
  switchText: { color: '#fff', fontWeight: 'bold' },
  saveBtn: { backgroundColor: '#2196F3', padding: 10, borderRadius: 6, alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: 'bold' }
});
