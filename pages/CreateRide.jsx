import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { createRidePost } from '../services/ridePostService';
import { AuthContext } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

const CreateRide = () => {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [availableSeats, setAvailableSeats] = useState('');
  const [price, setPrice] = useState('');

  const { user } = useContext(AuthContext);
  const navigation = useNavigation();

  const handleCreateRide = async () => {
    if (!source || !destination || !departureTime || !availableSeats || !price) {
      Alert.alert('Validation Error', 'All fields are required.');
      return;
    }

    try {
      const rideData = {
        source,
        destination,
        departureTime,
        availableSeats: parseInt(availableSeats),
        price: parseFloat(price),
        ownerId: user.id,
      };

      await createRidePost(rideData);
      Alert.alert('Success', 'Ride created successfully!');
      navigation.navigate('Dashboard');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to create ride. Please try again.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create a Ride</Text>

      <TextInput
        placeholder="Source"
        value={source}
        onChangeText={setSource}
        style={styles.input}
      />
      <TextInput
        placeholder="Destination"
        value={destination}
        onChangeText={setDestination}
        style={styles.input}
      />
      <TextInput
        placeholder="Departure Time (e.g., 2025-04-20T14:00)"
        value={departureTime}
        onChangeText={setDepartureTime}
        style={styles.input}
      />
      <TextInput
        placeholder="Available Seats"
        value={availableSeats}
        onChangeText={setAvailableSeats}
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        placeholder="Price"
        value={price}
        onChangeText={setPrice}
        keyboardType="decimal-pad"
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={handleCreateRide}>
        <Text style={styles.buttonText}>Post Ride</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 24,
    textAlign: 'center',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 14,
    marginBottom: 16,
    borderRadius: 10,
  },
  button: {
    backgroundColor: '#1976D2',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default CreateRide;
