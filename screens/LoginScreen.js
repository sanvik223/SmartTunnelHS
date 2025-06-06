import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Alert } from 'react-native';
import { auth, database } from '../firebase/firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { ref, get } from 'firebase/database';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const userRef = ref(database, 'users/' + user.uid);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        const userType = snapshot.val().userType;
        navigation.navigate(userType === 'host' ? 'HostDashboard' : 'ClientDashboard');
      } else {
        Alert.alert("Error", "User type not found");
      }
    } catch (error) {
      Alert.alert("Login Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        placeholder="Email"
        onChangeText={setEmail}
        value={email}
        style={styles.input}
        keyboardType="email-address"
      />
      <TextInput
        placeholder="Password"
        onChangeText={setPassword}
        value={password}
        style={styles.input}
        secureTextEntry
      />
      <Button title="Login" onPress={handleLogin} />
      <Text style={styles.link} onPress={() => navigation.navigate('ForgotPassword')}>
        Forgot Password?
      </Text>
      <Text style={styles.link} onPress={() => navigation.navigate('Register')}>
        Don’t have an account? Register
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', marginBottom: 10, padding: 10, borderRadius: 5 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  link: { marginTop: 15, color: 'blue', textAlign: 'center' }
});
