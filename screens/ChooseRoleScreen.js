// screens/ChooseRoleScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function ChooseRoleScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔰 Choose Your Role</Text>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#4CAF50' }]}
        onPress={() => navigation.navigate('HostDashboard')}
      >
        <Text style={styles.buttonText}>🧑‍💻 I am a Host</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#3F51B5' }]}
        onPress={() => navigation.navigate('ClientDashboard')}
      >
        <Text style={styles.buttonText}>📱 I am a Client</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
  button: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 15
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16
  }
});
