// screens/RegisterScreen.js

import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Alert } from 'react-native';
import { auth, database } from '../firebase/firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, set } from 'firebase/database';

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('client'); // 'host' or 'client'

  const handleRegister = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await set(ref(database, 'users/' + user.uid), {
        email: user.email,
        userType: userType
      });
      Alert.alert("Success", "Account created!");
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert("Registration Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register as</Text>
      <View style={styles.buttonGroup}>
        <Button
          title="Host"
          onPress={() => setUserType('host')}
          color={userType === 'host' ? '#007bff' : 'gray'}
        />
        <Button
          title="Client"
          onPress={() => setUserType('client')}
          color={userType === 'client' ? '#007bff' : 'gray'}
        />
      </View>
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
      <Button title="Register" onPress={handleRegister} />
      <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
        Already have an account? Login
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
    padding: 10,
    borderRadius: 5
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center'
  },
  link: {
    marginTop: 20,
    color: 'blue',
    textAlign: 'center'
  }
});
