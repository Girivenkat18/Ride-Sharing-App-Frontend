import React, { useContext, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import ridePostService from '../services/ridePostService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Dashboard = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [ridePosts, setRidePosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUserRidePosts = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const posts = await ridePostService.getMyRides(token);
      setRidePosts(posts);
    } catch (error) {
      console.error('Error fetching ride posts:', error);
      Alert.alert('Error', 'Failed to load ride posts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserRidePosts();
  }, []);

  const renderRidePost = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('RideDetails', { rideId: item.id })}
    >
      <Text style={styles.cardTitle}>{item.source} → {item.destination}</Text>
      <Text style={styles.cardSub}>{new Date(item.dateTime).toLocaleString()}</Text>
      <Text style={styles.cardStatus}>Seats: {item.availableSeats}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Welcome, {user?.name || 'User'} 👋</Text>

      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('CreateRide')}
      >
        <Text style={styles.createButtonText}>+ Create New Ride</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Your Ride Posts</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#1976D2" />
      ) : (
        <FlatList
          data={ridePosts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderRidePost}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}
    </View>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F7F9FC',
  },
  header: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  createButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 12,
    color: '#444',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    elevation: 2,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardSub: {
    color: '#555',
    marginTop: 4,
  },
  cardStatus: {
    marginTop: 6,
    color: '#777',
  },
});
