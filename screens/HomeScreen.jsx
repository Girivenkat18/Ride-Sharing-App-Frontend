import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, Image, SafeAreaView, StatusBar } from 'react-native';
import { TextInput } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import { API_BASE_URL } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RidesList from './RideList';
import LinearGradient from 'react-native-linear-gradient';

const HomeScreen = () => {
  const { user, isLoggedIn } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    source: '',
    destination: '',
    rideDate: new Date(),
    passengers: '',
    vehicleType: 'Two Wheeler',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [rides, setRides] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showRidesModal, setShowRidesModal] = useState(false);
  const [requestedRideIds, setRequestedRideIds] = useState([]);

  const handleSearch = async () => {
    if (!formData.source || !formData.destination) {
      Alert.alert('Validation Error', 'Please enter source and destination locations');
      return;
    }

    const { source, destination, rideDate, vehicleType } = formData;
    const pad = (n) => n < 10 ? '0' + n : n;
    const formattedDate = `${rideDate.getFullYear()}-${pad(rideDate.getMonth() + 1)}-${pad(rideDate.getDate())}`;


    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('token');

      if (!token) {
        Alert.alert('Authentication Error', 'You need to be logged in to search rides.');
        setIsLoading(false);
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/rideposts/search`, {
        params: {
          source,
          destination,
          rideDate: formattedDate,
          vehicleType,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      });

      setRides(response.data);

      const requestsResponse = await axios.get(`${API_BASE_URL}/api/ride-requests/by-user`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const rideIds = requestsResponse.data.map(req => req.ride.ridepostId);
      setRequestedRideIds(rideIds);
      
      if (response.data.length === 0) {
        Alert.alert('No Rides Found', 'No rides match your search criteria. Try changing your search parameters.');
      } else {
        setShowRidesModal(true);
      }
    } catch (error) {
      console.error('Error searching rides:', error);
      if (error.response) {
        if (error.response.status === 403) {
          Alert.alert('Authentication Error', 'Your session may have expired. Please login again.');
        } else {
          Alert.alert('Error', `Failed to fetch rides: ${error.response.data?.message || 'Unknown error'}`);
        }
      } else if (error.request) {
        Alert.alert('Network Error', 'No response from server. Please check your connection.');
      } else {
        Alert.alert('Error', `An unexpected error occurred: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRide = async (ridePostId) => {
    if (requestedRideIds.includes(ridePostId)) {
      Alert.alert('Request Pending', 'You have already requested to join this ride. Please wait for the response.');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');

      if (!token) {
        Alert.alert('Authentication Error', 'You must be logged in to join a ride.');
        return;
      }

      await axios.post(
        `${API_BASE_URL}/api/ride-requests/create`,
        null,
        {
          params: { ridePostId },
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      Alert.alert('Request Sent', 'Your request has been sent successfully.');
    } catch (error) {
      console.error('Join Ride Error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to join ride.');
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData(prev => ({ ...prev, rideDate: selectedDate }));
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const renderRideItem = (item, index) => (
    <View key={item.ridepostId || index} style={styles.rideItem}>
      <View style={styles.rideItemHeader}>
        <View style={styles.routeContainer}>
          <Icon name="map-marker" size={20} color="#3E92CC" />
          <Text style={styles.routeText}>{item.source}</Text>
          <Icon name="arrow-right" size={16} color="#666" style={styles.arrowIcon} />
          <Icon name="map-marker-check" size={20} color="#16DB93" />
          <Text style={styles.routeText}>{item.destination}</Text>
        </View>
        <View style={styles.fareContainer}>
          <Text style={styles.fareAmount}>₹{item.fare}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Icon name="account" size={18} color="#666" />
            <Text style={styles.detailText}>{item.owner?.full_name || item.owner?.name}</Text>
          </View>
          <View style={styles.detailItem}>
            <Icon name="phone" size={18} color="#666" />
            <Text style={styles.detailText}>{item.owner?.contact_no || 'N/A'}</Text>
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
          <Text style={styles.detailText}>{item.vehicleName} ({item.vehicleType})</Text>
        </View>
          <View style={styles.detailItem}>
            <Icon name="calendar" size={18} color="#666" />
            <Text style={styles.detailText}>{formatDate(item.rideDate)}</Text>
          </View>
        </View>
        
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Icon name="clock-outline" size={18} color="#666" />
            <Text style={styles.detailText}>{item.rideTime || 'Flexible'}</Text>
          </View>
          <View style={styles.detailItem}>
            <Icon name="account-group" size={18} color="#666" />
            <Text style={styles.detailText}>{item.passengerLimit} seats</Text>
          </View>
        </View>

        {item.notes && (
          <View style={styles.notesContainer}>
            <Icon name="note-text-outline" size={18} color="#666" />
            <Text style={styles.notesText}>{item.notes}</Text>
          </View>
        )}
      </View>

      <TouchableOpacity 
        style={requestedRideIds.includes(item.ridepostId) ? styles.requestedButton : styles.joinButton} 
        onPress={() => handleJoinRide(item.ridepostId)}
        disabled={requestedRideIds.includes(item.ridepostId)}
      >
        <Icon name={requestedRideIds.includes(item.ridepostId) ? "clock-outline" : "car-multiple"} size={20} color="#fff" style={styles.buttonIcon} />
        <Text style={styles.buttonText}>
          {requestedRideIds.includes(item.ridepostId) ? 'Request Pending' : 'Join Ride'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#3E92CC" barStyle="light-content" />
      <ScrollView style={styles.container}>
        <LinearGradient colors={['#3E92CC', '#16DB93']} style={styles.header}>
          <View style={styles.waveContainer}>
            <View style={styles.wave} />
          </View>
          <Text style={styles.headerTitle}>Find Your Ride</Text>
          <Text style={styles.headerSubtitle}>Search for available rides nearby</Text>
        </LinearGradient>

        <View style={styles.formContainer}>
          <View style={styles.locationSection}>
            <View style={styles.locationInputWrapper}>
              <Icon name="map-marker" size={22} color="#3E92CC" style={styles.inputIcon} />
              <TextInput
                mode="flat"
                label="From"
                placeholder="Enter pickup location"
                value={formData.source}
                onChangeText={(text) => setFormData(prev => ({ ...prev, source: text }))}
                style={styles.locationInput}
                underlineColor="transparent"
                activeUnderlineColor="#3E92CC"
                theme={{ colors: { primary: '#3E92CC', text: '#333' } }}
              />
            </View>
            
            <View style={styles.locationDivider}>
              <View style={styles.verticalLine} />
            </View>
            
            <View style={styles.locationInputWrapper}>
              <Icon name="map-marker-check" size={22} color="#16DB93" style={styles.inputIcon} />
              <TextInput
                mode="flat"
                label="To"
                placeholder="Enter destination"
                value={formData.destination}
                onChangeText={(text) => setFormData(prev => ({ ...prev, destination: text }))}
                style={styles.locationInput}
                underlineColor="transparent"
                activeUnderlineColor="#16DB93"
                theme={{ colors: { primary: '#16DB93', text: '#333' } }}
              />
            </View>
          </View>

          <View style={styles.dateTimeSection}>
            <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowDatePicker(true)}>
              <Icon name="calendar" size={20} color="#3E92CC" />
              <Text style={styles.dateText}>{formData.rideDate.toLocaleDateString()}</Text>
              <Icon name="chevron-down" size={18} color="#666" />
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={formData.rideDate}
                mode="date"
                display="default"
                onChange={onDateChange}
                minimumDate={new Date()}
              />
            )}
          </View>

          <View style={styles.twoColumnSection}>
            <View style={styles.halfColumn}>
              <Text style={styles.inputLabel}>Passengers</Text>
              <TextInput
                mode="outlined"
                placeholder="Number of seats"
                value={formData.passengers}
                onChangeText={(text) => setFormData(prev => ({ ...prev, passengers: text }))}
                style={styles.input}
                keyboardType="numeric"
                outlineColor="#ddd"
                activeOutlineColor="#3E92CC"
                left={<TextInput.Icon icon="account-group" color="#3E92CC" />}
                theme={{ colors: { primary: '#3E92CC', text: '#333' } }}
              />
            </View>
            
            <View style={styles.halfColumn}>
              <Text style={styles.inputLabel}>Transport Type</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.vehicleType}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, vehicleType: value }))}
                  style={styles.picker}
                >
                  <Picker.Item label="Two Wheeler" value="Two Wheeler" />
                  <Picker.Item label="Four Wheeler" value="Four Wheeler" />
                  <Picker.Item label="Auto" value="Auto" />
                </Picker>
                <Icon name="chevron-down" size={18} color="#666" style={styles.pickerIcon} />
              </View>
            </View>
          </View>

          <TouchableOpacity 
            style={isLoading ? styles.loadingButton : styles.searchButton} 
            onPress={handleSearch} 
            disabled={isLoading}
          >
            {isLoading ? (
              <Text style={styles.searchButtonText}>Searching...</Text>
            ) : (
              <>
                <Icon name="magnify" size={22} color="#fff" style={styles.searchIcon} />
                <Text style={styles.searchButtonText}>Search Rides</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={showRidesModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowRidesModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <LinearGradient colors={['#3E92CC', '#16DB93']} style={styles.modalHeader}>
            <View style={styles.modalHeaderContent}>
              <TouchableOpacity onPress={() => setShowRidesModal(false)} style={styles.backButton}>
                <Icon name="arrow-left" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Available Rides</Text>
            </View>
          </LinearGradient>

          <View style={styles.resultSummary}>
            <Text style={styles.resultText}>
              {rides.length} {rides.length === 1 ? 'ride' : 'rides'} found from {formData.source} to {formData.destination}
            </Text>
          </View>

          <ScrollView contentContainerStyle={styles.ridesContainer}>
            {rides.map((item, index) => renderRideItem(item, index))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
    paddingTop: 30,
    paddingBottom: 60,
    paddingHorizontal: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  waveContainer: {
    position: 'absolute',
    bottom: -20,
    left: 0,
    right: 0,
    height: 80,
  },
  wave: {
    position: 'absolute',
    bottom: 0,
    height: 60,
    width: '100%',
    backgroundColor: '#f9f9f9',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  formContainer: {
    marginTop: -30,
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    marginHorizontal: 15,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  locationSection: {
    marginBottom: 20,
  },
  locationInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  locationDivider: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    marginLeft: 22,
  },
  verticalLine: {
    height: 20,
    width: 1,
    backgroundColor: '#ddd',
  },
  inputIcon: {
    marginRight: 8,
  },
  locationInput: {
    flex: 1,
    backgroundColor: '#fff',
    height: 50,
  },
  dateTimeSection: {
    marginBottom: 20,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 15,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  twoColumnSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  halfColumn: {
    width: '48%',
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
    marginLeft: 2,
  },
  input: {
    backgroundColor: '#fff',
    height: 50,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    height: 50,
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
  },
  pickerIcon: {
    position: 'absolute',
    right: 10,
    top: 15,
  },
  searchButton: {
    backgroundColor: '#3E92CC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  loadingButton: {
    backgroundColor: '#90CAF9',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  modalHeader: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  backButton: {
    marginRight: 15,
    padding: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  resultSummary: {
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  resultText: {
    fontSize: 15,
    color: '#666',
  },
  ridesContainer: {
    padding: 15,
  },
  rideItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  rideItemHeader: {
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
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 5,
    color: '#333',
  },
  arrowIcon: {
    marginHorizontal: 6,
  },
  fareContainer: {
    backgroundColor: '#f0f7ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0eeff',
  },
  fareAmount: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#3E92CC',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 12,
  },
  detailsContainer: {
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 8,
  },
  notesContainer: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 8,
    marginTop: 5,
  },
  notesText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 8,
    flex: 1,
  },
  joinButton: {
    backgroundColor: '#16DB93',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  requestedButton: {
    backgroundColor: '#F9A826',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default HomeScreen;