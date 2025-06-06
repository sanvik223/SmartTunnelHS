// screens/HostDashboard.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet, Linking, ScrollView } from 'react-native';
import { database } from '../firebaseConfig';
import { ref, onValue, update, remove } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';

import { PieChart, Pie, Cell, Tooltip } from 'recharts';

export default function HostDashboard() {
  const [requests, setRequests] = useState([]);
  const [clients, setClients] = useState([]);
  const [usageData, setUsageData] = useState([]);

  const user = getAuth().currentUser;
  const userId = user?.uid;
  const navigation = useNavigation();

  const COLORS = ['#00C49F', '#FF8042', '#FFBB28', '#0088FE', '#FF4567'];

  useEffect(() => {
    if (!userId) return;

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

    const unsubscribeUsage = onValue(connRef, snapshot => {
      const val = snapshot.val() || {};
      const usage = Object.keys(val).map((ip, index) => ({
        name: val[ip].email || ip,
        value: Math.round((val[ip].mbUsed || 0) / (1024 * 1024)),
      }));
      setUsageData(usage);
    });

    return () => {
      unsubscribeReq();
      unsubscribeCon();
      unsubscribeUsage();
    };
  }, [userId]);

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

  const startServer = async () => {
    if (!userId) {
      Alert.alert('Error', 'User not logged in');
      return;
    }

    const command = `node /storage/emulated/0/SmartTunnel/server.js ${userId}`;

    try {
      await Linking.openURL(`termux://new_command?command=${encodeURIComponent(command)}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to open Termux or run command.');
      console.error(error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
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

      <Text style={styles.heading}>📊 Client Usage (MB)</Text>
      <View style={{ alignItems: 'center', marginTop: 10 }}>
        <PieChart width={300} height={250}>
          <Pie
            data={usageData}
            cx={150}
            cy={100}
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, value }) => `${name}: ${value}MB`}
          >
            {usageData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </View>

      <TouchableOpacity
        style={styles.qrButton}
        onPress={() => navigation.navigate("HostQR")}
      >
        <Text style={styles.qrButtonText}>📤 Show QR</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.startButton}
        onPress={startServer}
      >
        <Text style={styles.qrButtonText}>🧩 Start Proxy Server</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.manageButton}
        onPress={() => navigation.navigate("ClientControl")}
      >
        <Text style={styles.qrButtonText}>🛠 Manage Clients</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff', paddingBottom: 50 },
  heading: { fontSize: 20, fontWeight: 'bold', marginTop: 20 },
  item: { padding: 10, marginVertical: 5, backgroundColor: '#f0f0f0', borderRadius: 8 },
  buttons: { flexDirection: 'row', marginTop: 5, gap: 10 },
  accept: { backgroundColor: '#4CAF50', padding: 8, borderRadius: 6, marginRight: 10 },
  reject: { backgroundColor: '#F44336', padding: 8, borderRadius: 6 },
  btnText: { color: '#fff', fontWeight: 'bold' },
  qrButton: { backgroundColor: '#2196F3', padding: 12, borderRadius: 8, marginTop: 20 },
  startButton: { backgroundColor: '#3F51B5', padding: 12, borderRadius: 8, marginTop: 15 },
  manageButton: { backgroundColor: '#795548', padding: 12, borderRadius: 8, marginTop: 15 },
  qrButtonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' }
});
