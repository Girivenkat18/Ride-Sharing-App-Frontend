import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';
import { getRidesByOwner } from '../services/ridePostService';
import { AuthContext } from '../context/AuthContext';
import { useIsFocused } from '@react-navigation/native';

const MyRides = () => {
  const [rides, setRides] = useState([]);
  const { user } = useContext(AuthContext);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused && user?.id) fetchRides();
  }, [isFocused]);

  const fetchRides = async () => {
    try {
      const data = await getRidesByOwner(user.id);
      setRides(data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to fetch your rides.');
    }
  };

  const renderRide = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.label}>From:</Text>
      <Text style={styles.value}>{item.source}</Text>
      <Text style={styles.label}>To:</Text>
      <Text style={styles.value}>{item.destination}</Text>
      <Text style={styles.label}>Date:</Text>
      <Text style={styles.value}>{new Date(item.ride_time).toLocaleString()}</Text>
      <Text style={styles.label}>Status:</Text>
      <Text style={styles.value}>{item.status}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Rides</Text>
      <FlatList
        data={rides}
        keyExtractor={(item) => item.ride_id.toString()}
        renderItem={renderRide}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={<Text style={styles.emptyText}>You haven't created any rides yet.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#f1f5f9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  label: {
    fontWeight: '600',
    fontSize: 14,
  },
  value: {
    marginBottom: 8,
    fontSize: 15,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
    marginTop: 40,
  },
});

export default MyRides;
