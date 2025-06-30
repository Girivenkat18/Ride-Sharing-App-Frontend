import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  SafeAreaView,
  StatusBar,
  Modal,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '../services/api';
import LinearGradient from 'react-native-linear-gradient';
import { AuthContext } from '../context/AuthContext';
// import RideHistoryScreen from '../backup/screens/RideHistoryScreen';

const RideHistoryScreen = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [rides, setRides] = useState({
    upcoming: [],
    previous: [],
    pending: [],
  });
  const [loading, setLoading] = useState(true);
  const [selectedRide, setSelectedRide] = useState(null);
  const [showRideDetailModal, setShowRideDetailModal] = useState(false);

  useEffect(() => {
    fetchRideInfo();
  }, []);

  // Format date helper function
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const fetchRideInfo = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Unauthorized', 'Please login again.');
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/ride-history`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          include_details: true,
        },
      });

      console.log("My ride info data received:", JSON.stringify(response.data, null, 2));

      // Process the data to ensure all required fields exist
      const processedData = {
        upcoming: (response.data.upcoming || []).map(enrichRideData),
        previous: (response.data.previous || []).map(enrichRideData),
        pending: (response.data.pending || []).map(enrichRideData),
      };

      setRides(processedData);
    } catch (error) {
      console.error('Ride info fetch error:', error);
      Alert.alert('Error', 'Failed to load your ride information.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to ensure all required fields exist in ride data
  const enrichRideData = (ride) => {
    if (!ride) return {};
    
    return {
      ...ride,
      owner: ride.owner || ride.driver || {},
      vehicleType: ride.vehicleType || ride.vehicle?.type || 'Standard',
      vehicle_name: ride.vehicle_name || ride.vehicleName || ride.vehicle?.name || 'N/A',
      fare: ride.fare || ride.price || 0,
      passengerLimit: ride.passengerLimit || ride.seats || 'N/A',
      notes: ride.notes || ride.description || '',
      status: ride.status || 'pending',
      rideTime: ride.rideTime || 'Flexible',
    };
  };

  const handleViewRideDetails = (ride) => {
    setSelectedRide(ride);
    setShowRideDetailModal(true);
  };

  const handleCancelRide = async (rideId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Unauthorized', 'Please login again.');
        return;
      }

      await axios.post(
        `${API_BASE_URL}/api/rides/cancel`,
        { ridepostId: rideId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Alert.alert('Success', 'Ride cancelled successfully');
      fetchRideInfo(); // Refresh the ride list
    } catch (error) {
      console.error('Cancel ride error:', error);
      Alert.alert('Error', 'Failed to cancel ride. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'accepted':
        return '#16DB93';
      case 'completed':
        return '#3E92CC';
      case 'pending':
        return '#F9A826';
      case 'cancelled':
        return '#E63946';
      default:
        return '#666';
    }
  };

  const renderRideItem = ({ item }) => {
    if (!item) return null;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleViewRideDetails(item)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.routeContainer}>
            <Icon name="map-marker" size={20} color="#3E92CC" />
            <Text style={styles.routeText}>{item.source || 'N/A'}</Text>
            <Icon name="arrow-right" size={16} color="#666" style={styles.arrowIcon} />
            <Icon name="map-marker-check" size={20} color="#16DB93" />
            <Text style={styles.routeText}>{item.destination || 'N/A'}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status?.charAt(0).toUpperCase() + item.status?.slice(1) || 'N/A'}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.cardBody}>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Icon name="calendar" size={16} color="#666" />
              <Text style={styles.detailText}>{formatDate(item.rideDate)}</Text>
            </View>
            <View style={styles.detailItem}>
              <Icon name="clock-outline" size={16} color="#666" />
              <Text style={styles.detailText}>{item.rideTime}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Icon name="currency-inr" size={16} color="#666" />
              <Text style={styles.detailText}>₹{item.fare}</Text>
            </View>
            <View style={styles.detailItem}>
              <Icon name="account-group" size={16} color="#666" />
              <Text style={styles.detailText}>{item.passengerLimit} seats</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Icon 
              name={
                item.vehicleType === 'Two Wheeler' ? 'motorbike' : 
                item.vehicleType === 'Four Wheeler' ? 'car' : 
                'car-multiple'  // Changed from 'auto-rickshaw' to 'car-multiple' which is available in MaterialCommunityIcons
              } 
              size={18} 
              color="#666" 
            />
            <Text style={styles.detailText}>{item.vehicle_name} ({item.vehicleType})</Text>
          </View>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <TouchableOpacity style={styles.moreButton}>
            <Text style={styles.moreButtonText}>View Details</Text>
            <Icon name="chevron-right" size={16} color="#3E92CC" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderRideDetailModal = () => {
    if (!selectedRide) return null;

    return (
      <Modal
        visible={showRideDetailModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowRideDetailModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <LinearGradient colors={['#3E92CC', '#16DB93']} style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => setShowRideDetailModal(false)} 
              style={styles.backButton}
            >
              <Icon name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Ride Details</Text>
          </LinearGradient>

          <ScrollView style={styles.modalBody}>
            <View style={styles.routeSection}>
              <View style={styles.routeItem}>
                <Icon name="map-marker" size={24} color="#3E92CC" />
                <View style={styles.routeDetail}>
                  <Text style={styles.routeLabel}>Pickup Location</Text>
                  <Text style={styles.routeValue}>{selectedRide.source}</Text>
                </View>
              </View>
              
              <View style={styles.routeConnector}>
                <View style={styles.connectorLine} />
              </View>
              
              <View style={styles.routeItem}>
                <Icon name="map-marker-check" size={24} color="#16DB93" />
                <View style={styles.routeDetail}>
                  <Text style={styles.routeLabel}>Destination</Text>
                  <Text style={styles.routeValue}>{selectedRide.destination}</Text>
                </View>
              </View>
            </View>

            <View style={styles.statusSection}>
              <View style={[styles.statusBadgeLarge, { backgroundColor: getStatusColor(selectedRide.status) + '20' }]}>
                <Text style={[styles.statusTextLarge, { color: getStatusColor(selectedRide.status) }]}>
                  {selectedRide.status?.charAt(0).toUpperCase() + selectedRide.status?.slice(1) || 'N/A'}
                </Text>
              </View>
            </View>

            <View style={styles.detailsSection}>
              <Text style={styles.sectionTitle}>Ride Information</Text>
              <View style={styles.detailsGrid}>
                <View style={styles.detailsGridItem}>
                  <Icon name="calendar" size={22} color="#3E92CC" />
                  <View style={styles.detailsGridItemContent}>
                    <Text style={styles.detailsGridItemLabel}>Date</Text>
                    <Text style={styles.detailsGridItemValue}>{formatDate(selectedRide.rideDate)}</Text>
                  </View>
                </View>

                <View style={styles.detailsGridItem}>
                  <Icon name="clock-outline" size={22} color="#3E92CC" />
                  <View style={styles.detailsGridItemContent}>
                    <Text style={styles.detailsGridItemLabel}>Time</Text>
                    <Text style={styles.detailsGridItemValue}>{selectedRide.rideTime}</Text>
                  </View>
                </View>

                <View style={styles.detailsGridItem}>
                  <Icon name="currency-inr" size={22} color="#3E92CC" />
                  <View style={styles.detailsGridItemContent}>
                    <Text style={styles.detailsGridItemLabel}>Fare</Text>
                    <Text style={styles.detailsGridItemValue}>₹{selectedRide.fare}</Text>
                  </View>
                </View>

                <View style={styles.detailsGridItem}>
                  <Icon name="account-group" size={22} color="#3E92CC" />
                  <View style={styles.detailsGridItemContent}>
                    <Text style={styles.detailsGridItemLabel}>Seats</Text>
                    <Text style={styles.detailsGridItemValue}>{selectedRide.passengerLimit}</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.detailsSection}>
              <Text style={styles.sectionTitle}>Vehicle Information</Text>
              <View style={styles.detailItem}>
                <Icon 
                  name={
                    selectedRide.vehicleType === 'Two Wheeler' ? 'motorbike' : 
                    selectedRide.vehicleType === 'Four Wheeler' ? 'car' : 
                    'car-multiple'  
                  } 
                  size={18} 
                  color="#666" 
                />
                <Text style={styles.detailText}>{selectedRide.vehicleName} ({selectedRide.vehicleType})</Text>
              </View>
            </View>

            <View style={styles.detailsSection}>
              <Text style={styles.sectionTitle}>Contact Information</Text>
              <View style={styles.contactRow}>
                <Icon name="account" size={22} color="#3E92CC" />
                <Text style={styles.contactText}>
                  {selectedRide.full_name || selectedRide.owner?.name || 'N/A'}
                </Text>
              </View>

              <View style={styles.contactRow}>
                <Icon name="phone" size={22} color="#3E92CC" />
                <Text style={styles.contactText}>
                  {selectedRide.contact_no || selectedRide.owner?.phone || 'N/A'}
                </Text>
              </View>
            </View>

            {selectedRide.notes && (
              <View style={styles.detailsSection}>
                <Text style={styles.sectionTitle}>Notes</Text>
                <View style={styles.notesContainer}>
                  <Text style={styles.notesText}>{selectedRide.notes}</Text>
                </View>
              </View>
            )}

            {selectedRide.status === 'pending' || selectedRide.status === 'confirmed' ? (
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setShowRideDetailModal(false);
                  setTimeout(() => {
                    handleCancelRide(selectedRide.ridepostId);
                  }, 500);
                }}
              >
                <Icon name="close-circle" size={18} color="#fff" />
                <Text style={styles.cancelButtonText}>Cancel Ride</Text>
              </TouchableOpacity>
            ) : null}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#3E92CC" barStyle="light-content" />
      <View style={styles.container}>
        <LinearGradient colors={['#3E92CC', '#16DB93']} style={styles.header}>
          <Text style={styles.headerTitle}>My Rides</Text>
          <Text style={styles.headerSubtitle}>Manage your rides and bookings</Text>
        </LinearGradient>

        <View style={styles.tabContainer}>
          {['upcoming', 'previous', 'pending'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <FlatList
          data={rides[activeTab]}
          renderItem={renderRideItem}
          keyExtractor={(item, index) => `${item.ridepostId || item.requestId || index}`}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Icon name="car-off" size={60} color="#ccc" />
              <Text style={styles.emptyText}>
                {loading ? 'Loading rides...' : `No ${activeTab} rides found`}
              </Text>
              {!loading && (
                <Text style={styles.emptySubtext}>
                  {activeTab === 'upcoming' 
                    ? 'You don\'t have any upcoming rides scheduled'
                    : activeTab === 'pending' 
                      ? 'No pending ride requests'
                      : 'You haven\'t taken any rides yet'}
                </Text>
              )}
            </View>
          )}
        />

        {renderRideDetailModal()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  container: { 
    flex: 1, 
    backgroundColor: '#f9f9f9',
  },
  header: { 
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerTitle: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#fff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tab: { 
    flex: 1, 
    paddingVertical: 8,
    paddingHorizontal: 5,
    alignItems: 'center', 
    borderRadius: 20,
    marginHorizontal: 4,
  },
  activeTab: { 
    backgroundColor: '#e8f5e9',
  },
  tabText: { 
    fontSize: 14, 
    color: '#666', 
    fontWeight: '600',
  },
  activeTabText: { 
    color: '#3E92CC',
    fontWeight: 'bold',
  },
  listContainer: { 
    padding: 15,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  routeContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    flex: 1,
  },
  routeText: { 
    fontSize: 15, 
    fontWeight: '600', 
    color: '#333',
    marginLeft: 5,
  },
  arrowIcon: {
    marginHorizontal: 6,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 12,
  },
  cardBody: {
    marginBottom: 12,
  },
  detailRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailItem: { 
    flexDirection: 'row', 
    alignItems: 'center',
    flex: 1,
  },
  detailText: { 
    marginLeft: 8, 
    color: '#555', 
    fontSize: 14,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
    alignItems: 'flex-end',
  },
  moreButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moreButtonText: {
    fontSize: 14,
    color: '#3E92CC',
    fontWeight: '600',
    marginRight: 5,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 50,
  },
  emptyText: { 
    marginTop: 16, 
    fontSize: 18, 
    color: '#666',
    fontWeight: 'bold',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalBody: {
    flex: 1,
    padding: 15,
  },
  routeSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 5,
  },
  routeDetail: {
    marginLeft: 12,
    flex: 1,
  },
  routeLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  routeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  routeConnector: {
    paddingLeft: 12,
    marginVertical: 5,
  },
  connectorLine: {
    height: 20,
    width: 1,
    backgroundColor: '#ddd',
    marginLeft: 11,
  },
  statusSection: {
    alignItems: 'center',
    marginBottom: 15,
  },
  statusBadgeLarge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusTextLarge: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  detailsSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailsGridItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  detailsGridItemContent: {
    marginLeft: 10,
  },
  detailsGridItemLabel: {
    fontSize: 12,
    color: '#666',
  },
  detailsGridItemValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  vehicleText: {
    marginLeft: 10,
    fontSize: 15,
    color: '#333',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactText: {
    marginLeft: 10,
    fontSize: 15,
    color: '#333',
  },
  notesContainer: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
  },
  notesText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  cancelButton: {
    backgroundColor: '#E63946',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 30,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default RideHistoryScreen;