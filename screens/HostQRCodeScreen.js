// screens/HostQRCodeScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { getAuth } from 'firebase/auth';

export default function HostQRCodeScreen() {
  const user = getAuth().currentUser;
  const hostId = user?.uid;
  const hostIP = '192.168.43.1'; // আপনার হোস্ট ফোনের IP (হটস্পট চালু থাকলে এটি সাধারণত হয়)
  const hostPort = '8080'; // যে পোর্টে আপনি আপনার প্রক্সি চালাবেন

  const qrData = {
    hostId,
    hostIP,
    hostPort
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📤 Share QR with Client</Text>
      <QRCode value={JSON.stringify(qrData)} size={250} />
      <Text style={styles.info}>ID: {hostId}</Text>
      <Text style={styles.info}>IP: {hostIP}</Text>
      <Text style={styles.info}>Port: {hostPort}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  info: { fontSize: 16, marginTop: 8 }
});
