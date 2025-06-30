import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const RideList = ({ rides }) => {
  // Format the date string to a readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const renderRideItem = ({ item }) => (
    <View style={styles.rideItem}>
      <View style={styles.routeContainer}>
        <Icon name="map-marker" size={20} color="#388E3C" />
        <Text style={styles.routeText}>{item.source} to {item.destination}</Text>
      </View>
      
      <View style={styles.detailsContainer}>
        <View style={styles.detailItem}>
          <Icon name="calendar" size={18} color="#666" />
          <Text style={styles.detailText}>Date: {formatDate(item.date)}</Text>
        </View>
        
        <View style={styles.detailItem}>
          <Icon name="car" size={18} color="#666" />
          <Text style={styles.detailText}>Vehicle: {item.vehicleType}</Text>
        </View>
        
        {item.passengers && (
          <View style={styles.detailItem}>
            <Icon name="account-group" size={18} color="#666" />
            <Text style={styles.detailText}>Passengers: {item.passengers}</Text>
          </View>
        )}
      </View>
      
      <TouchableOpacity style={styles.bookButton}>
        <Text style={styles.bookButtonText}>View Details</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Available Rides</Text>
      <FlatList
        data={rides}
        renderItem={renderRideItem}
        keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
        contentContainerStyle={styles.listContent}
        scrollEnabled={false} // Disable scrolling in this FlatList
        nestedScrollEnabled={true} // Enable nested scrolling
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  listContent: {
    paddingBottom: 20,
  },
  rideItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  routeText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#333',
  },
  detailsContainer: {
    marginBottom: 15,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  detailText: {
    fontSize: 16,
    marginLeft: 8,
    color: '#555',
  },
  bookButton: {
    backgroundColor: '#388E3C',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default RideList;