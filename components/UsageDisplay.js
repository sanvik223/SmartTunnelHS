import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { getDatabase, ref, onValue } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const UsageDisplay = () => {
  const [usage, setUsage] = useState(0);

  useEffect(() => {
    const auth = getAuth();
    const db = getDatabase();
    const user = auth.currentUser;

    if (user) {
      const usageRef = ref(db, `clients/${user.uid}/${user.uid}/usage`);
      onValue(usageRef, (snapshot) => {
        const val = snapshot.val() || 0;
        setUsage(val);
      });
    }
  }, []);

  const formatMB = (bytes) => (bytes / (1024 * 1024)).toFixed(2);

  return (
    <View style={{ padding: 10 }}>
      <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
        ব্যবহার করা ডেটা: {formatMB(usage)} MB
      </Text>
    </View>
  );
};

export default UsageDisplay;
