// screens/UsageGraphScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, Dimensions, StyleSheet, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { ref, onValue } from 'firebase/database';
import { database } from '../firebaseConfig';
import { getAuth } from 'firebase/auth';

export default function UsageGraphScreen() {
  const [usageData, setUsageData] = useState([]);
  const user = getAuth().currentUser;
  const userId = user?.uid;

  useEffect(() => {
    if (!userId) return;

    const usageRef = ref(database, `usage/${userId}`);
    const unsubscribe = onValue(usageRef, snapshot => {
      const data = snapshot.val() || {};
      const sortedData = Object.entries(data)
        .sort((a, b) => a[1].timestamp - b[1].timestamp)
        .map(([key, value]) => ({
          date: new Date(value.timestamp).toLocaleDateString(),
          mb: value.mb
        }));

      setUsageData(sortedData);
    });

    return () => unsubscribe();
  }, [userId]);

  const chartData = {
    labels: usageData.map(item => item.date),
    datasets: [
      {
        data: usageData.map(item => item.mb),
        strokeWidth: 2
      }
    ]
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📊 MB Usage Over Time</Text>
      {usageData.length > 0 ? (
        <LineChart
          data={chartData}
          width={Dimensions.get('window').width - 32}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      ) : (
        <Text style={styles.noData}>No usage data available.</Text>
      )}
    </ScrollView>
  );
}

const chartConfig = {
  backgroundGradientFrom: '#fff',
  backgroundGradientTo: '#fff',
  decimalPlaces: 1,
  color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style: { borderRadius: 16 },
  propsForDots: { r: '4', strokeWidth: '2', stroke: '#2196F3' }
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  chart: { marginVertical: 8, borderRadius: 16 },
  noData: { textAlign: 'center', marginTop: 50, color: '#888' }
});
