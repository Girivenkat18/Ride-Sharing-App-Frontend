import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { TextInput } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { API_BASE_URL } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

const CreateRideScreen = () => {
  const [formData, setFormData] = useState({
    source: '',
    destination: '',
    rideDate: new Date(),
    rideTime: new Date(),
    fare: '',
    passengerLimit: '',
    vehicleType: 'Two Wheeler',
    vehicleName: '',
    notes: '',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    // Validate form data
    if (!formData.source || !formData.destination || !formData.fare || 
        !formData.passengerLimit || !formData.vehicleType || !formData.vehicleName) {
      Alert.alert('Validation Error', 'Please fill all required fields');
      return;
    }

    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        Alert.alert('Authentication Error', 'Please login to create a ride.');
        setIsLoading(false);
        return;
      }

      // const pad = (n) => n < 10 ? '0' + n : n;
      
      const rideData = {
        ...formData,
        rideDate: formData.rideDate.toISOString().split('T')[0], // format YYYY-MM-DD
        rideTime: formData.rideTime.toTimeString().split(' ')[0], // format HH:mm:ss

        
        // rideDate : `${rideDate.getFullYear()}-${pad(rideDate.getMonth() + 1)}-${pad(rideDate.getDate())}`
      };
  
      const response = await axios.post(
        `${API_BASE_URL}/api/rideposts/create`,
        rideData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
  
      Alert.alert('Success', 'Your ride has been created successfully!');
      
      // Reset form
      setFormData({
        source: '',
        destination: '',
        rideDate: new Date(),
        rideTime: new Date(),
        fare: '',
        passengerLimit: '',
        vehicleType: 'Two Wheeler',
        vehicleName: '',
        notes: '',
      });
    } catch (error) {
      console.error('Error creating ride:', error);
      if (error.response?.data?.message) {
        Alert.alert('Error', error.response.data.message);
      } else {
        Alert.alert('Failed', 'Could not create ride. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData(prev => ({ ...prev, rideDate: selectedDate }));
    }
  };

  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setFormData(prev => ({ ...prev, rideTime: selectedTime }));
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#3E92CC" barStyle="light-content" />
      <ScrollView style={styles.container}>
        <LinearGradient colors={['#3E92CC', '#16DB93']} style={styles.header}>
          <View style={styles.waveContainer}>
            <View style={styles.wave} />
          </View>
          <Text style={styles.headerTitle}>Create a Ride</Text>
          <Text style={styles.headerSubtitle}>Share your journey with others</Text>
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
            <View style={styles.twoColumnSection}>
              <View style={styles.halfColumn}>
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
              
              <View style={styles.halfColumn}>
                <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowTimePicker(true)}>
                  <Icon name="clock-outline" size={20} color="#3E92CC" />
                  <Text style={styles.dateText}>{formData.rideTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                  <Icon name="chevron-down" size={18} color="#666" />
                </TouchableOpacity>

                {showTimePicker && (
                  <DateTimePicker
                    value={formData.rideTime}
                    mode="time"
                    display="default"
                    onChange={onTimeChange}
                  />
                )}
              </View>
            </View>
          </View>

          <View style={styles.twoColumnSection}>
            <View style={styles.halfColumn}>
              <Text style={styles.inputLabel}>Fare Amount (₹)</Text>
              <TextInput
                mode="outlined"
                placeholder="Enter fare"
                value={formData.fare}
                onChangeText={(text) => setFormData(prev => ({ ...prev, fare: text }))}
                style={styles.input}
                keyboardType="numeric"
                outlineColor="#ddd"
                activeOutlineColor="#3E92CC"
                left={<TextInput.Icon icon="currency-inr" color="#3E92CC" />}
                theme={{ colors: { primary: '#3E92CC', text: '#333' } }}
              />
            </View>
            
            <View style={styles.halfColumn}>
              <Text style={styles.inputLabel}>Passenger Limit</Text>
              <TextInput
                mode="outlined"
                placeholder="Max seats"
                value={formData.passengerLimit}
                onChangeText={(text) => setFormData(prev => ({ ...prev, passengerLimit: text }))}
                style={styles.input}
                keyboardType="numeric"
                outlineColor="#ddd"
                activeOutlineColor="#3E92CC"
                left={<TextInput.Icon icon="account-group" color="#3E92CC" />}
                theme={{ colors: { primary: '#3E92CC', text: '#333' } }}
              />
            </View>
          </View>

          <View style={styles.twoColumnSection}>
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
            
            <View style={styles.halfColumn}>
              <Text style={styles.inputLabel}>Vehicle Name</Text>
              <TextInput
                mode="outlined"
                placeholder="Enter vehicle name"
                value={formData.vehicleName}
                onChangeText={(text) => setFormData(prev => ({ ...prev, vehicleName: text }))}
                style={styles.input}
                outlineColor="#ddd"
                activeOutlineColor="#3E92CC"
                left={<TextInput.Icon icon="car" color="#3E92CC" />}
                theme={{ colors: { primary: '#3E92CC', text: '#333' } }}
              />
            </View>
          </View>

          <View style={styles.notesSection}>
            <Text style={styles.inputLabel}>Additional Notes</Text>
            <TextInput
              mode="outlined"
              placeholder="Any additional information"
              value={formData.notes}
              onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
              style={styles.notesInput}
              multiline
              numberOfLines={4}
              outlineColor="#ddd"
              activeOutlineColor="#3E92CC"
              left={<TextInput.Icon icon="note-text-outline" color="#3E92CC" />}
              theme={{ colors: { primary: '#3E92CC', text: '#333' } }}
            />
          </View>

          <TouchableOpacity 
            style={isLoading ? styles.loadingButton : styles.submitButton} 
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <Text style={styles.buttonText}>Creating...</Text>
            ) : (
              <>
                <Icon name="car-multiple" size={22} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Create Ride</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    paddingVertical: 20,
    backgroundColor: '#fff',
    marginHorizontal: 15,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 20,
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
  twoColumnSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  halfColumn: {
    width: '48%',
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
  notesSection: {
    marginBottom: 20,
  },
  notesInput: {
    backgroundColor: '#fff',
    minHeight: 100,
    textAlignVertical: 'top',
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
  submitButton: {
    backgroundColor: '#16DB93',
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
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CreateRideScreen;