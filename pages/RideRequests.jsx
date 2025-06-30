import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { getRideRequestsByOwner, respondToRideRequest } from '../services/rideRequestService';
import { useIsFocused } from '@react-navigation/native';

const RideRequests = () => {
  const [requests, setRequests] = useState([]);
  const { user } = useContext(AuthContext);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) fetchRideRequests();
  }, [isFocused]);

  const fetchRideRequests = async () => {
    try {
      const data = await getRideRequestsByOwner(user.id);
      setRequests(data);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Could not load ride requests.');
    }
  };

  const handleResponse = async (requestId, action) => {
    try {
      await respondToRideRequest(requestId, action);
      Alert.alert('Success', `Request ${action.toLowerCase()}ed`);
      fetchRideRequests();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to update request status.');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.text}><Text style={styles.label}>From:</Text> {item.ride.source}</Text>
      <Text style={styles.text}><Text style={styles.label}>To:</Text> {item.ride.destination}</Text>
      <Text style={styles.text}><Text style={styles.label}>Requested by:</Text> {item.requester.name}</Text>
      <Text style={styles.text}><Text style={styles.label}>Message:</Text> {item.message || 'N/A'}</Text>
      <Text style={styles.text}><Text style={styles.label}>Status:</Text> {item.status}</Text>

      {item.status === 'PENDING' && (
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.acceptBtn} onPress={() => handleResponse(item.request_id, 'ACCEPTED')}>
            <Text style={styles.btnText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.rejectBtn} onPress={() => handleResponse(item.request_id, 'REJECTED')}>
            <Text style={styles.btnText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <FlatList
      contentContainerStyle={styles.container}
      data={requests}
      renderItem={renderItem}
      keyExtractor={(item) => item.request_id.toString()}
      ListEmptyComponent={<Text style={styles.empty}>No ride requests found.</Text>}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  card: {
    backgroundColor: '#f0f4f8',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },
  text: {
    fontSize: 15,
    marginBottom: 6,
  },
  label: {
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  acceptBtn: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 5,
    alignItems: 'center',
  },
  rejectBtn: {
    backgroundColor: '#F44336',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginLeft: 5,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: '600',
  },
  empty: {
    marginTop: 40,
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
  },
});

export default RideRequests;
