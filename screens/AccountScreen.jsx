import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  SafeAreaView,
  StatusBar,
  Modal
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '../services/api';
import LinearGradient from 'react-native-linear-gradient';
import { AuthContext } from '../context/AuthContext';
import { TextInput } from 'react-native-paper';

const AccountScreen = () => {
  const { user } = useContext(AuthContext);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    full_name: '',
    email: '',
    contact_no: '',
    gender: '',
    age: ''
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Authentication Error', 'You must be logged in to view your profile.');
        setIsLoading(false);
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/user-info`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUserData(response.data);
      setEditFormData({
        full_name: response.data.full_name || '',
        email: response.data.email || '',
        contact_no: response.data.contact_no || '',
        gender: response.data.gender || '',
        age: response.data.age ? response.data.age.toString() : ''
      });
    } catch (error) {
      console.error('Error fetching user info:', error);
      if (error.response) {
        if (error.response.status === 403) {
          Alert.alert('Authentication Error', 'Your session may have expired. Please login again.');
        } else {
          Alert.alert('Error', `Failed to load profile data: ${error.response.data?.message || 'Unknown error'}`);
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

  const handleUpdateProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Authentication Error', 'You must be logged in to update your profile.');
        return;
      }

      const response = await axios.put(
        `${API_BASE_URL}/api/user-info/update`,
        editFormData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setUserData(response.data);
      setShowEditModal(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to update profile.');
    }
  };

  const renderInfoItem = (icon, label, value) => (
    <View style={styles.infoItem} key={label}>
      <View style={styles.infoIcon}>
        <Icon name={icon} size={22} color="#3E92CC" />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || 'Not provided'}</Text>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#3E92CC" barStyle="light-content" />
      <ScrollView style={styles.container}>
        <LinearGradient colors={['#3E92CC', '#16DB93']} style={styles.header}>
          <View style={styles.waveContainer}>
            <View style={styles.wave} />
          </View>
          
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData?.full_name || 'User')}&background=16DB93&color=fff&size=200` }}
                style={styles.avatar}
              />
              <TouchableOpacity style={styles.cameraButton}>
                <Icon name="camera" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
            <Text style={styles.name}>{userData?.full_name || 'User'}</Text>
            <Text style={styles.userType}>Verified User</Text>
          </View>
        </LinearGradient>

        <View style={styles.contentContainer}>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Rides</Text>
            </View>
            <View style={[styles.statItem, styles.statDivider]}>
              <Text style={styles.statValue}>95%</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>250</Text>
              <Text style={styles.statLabel}>Km Saved</Text>
            </View>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            <View style={styles.card}>
              {renderInfoItem('email-outline', 'Email', userData?.email)}
              {renderInfoItem('phone-outline', 'Phone', userData?.contact_no)}
              {renderInfoItem('human-male-female', 'Gender', userData?.gender)}
              {renderInfoItem('calendar', 'Age', userData?.age)}
            </View>
          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => setShowEditModal(true)}
            >
              <LinearGradient colors={['#3E92CC', '#16DB93']} style={styles.actionButtonGradient}>
                <Icon name="account-edit" size={22} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Edit Profile</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <LinearGradient colors={['#3E92CC', '#16DB93']} style={styles.actionButtonGradient}>
                <Icon name="security" size={22} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Privacy Settings</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <LinearGradient colors={['#FF7043', '#FF5722']} style={styles.actionButtonGradient}>
                <Icon name="logout" size={22} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Logout</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowEditModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <LinearGradient colors={['#3E92CC', '#16DB93']} style={styles.modalHeader}>
            <View style={styles.modalHeaderContent}>
              <TouchableOpacity onPress={() => setShowEditModal(false)} style={styles.backButton}>
                <Icon name="arrow-left" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Edit Profile</Text>
            </View>
          </LinearGradient>

          <ScrollView style={styles.modalContent}>
            <View style={styles.editAvatarContainer}>
              <Image
                source={{ uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData?.full_name || 'User')}&background=16DB93&color=fff&size=200` }}
                style={styles.editAvatar}
              />
              <TouchableOpacity style={styles.editCameraButton}>
                <Icon name="camera" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                mode="outlined"
                value={editFormData.full_name}
                onChangeText={(text) => setEditFormData(prev => ({ ...prev, full_name: text }))}
                style={styles.input}
                outlineColor="#ddd"
                activeOutlineColor="#3E92CC"
                left={<TextInput.Icon icon="account" color="#3E92CC" />}
                theme={{ colors: { primary: '#3E92CC', text: '#333' } }}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                mode="outlined"
                value={editFormData.email}
                onChangeText={(text) => setEditFormData(prev => ({ ...prev, email: text }))}
                style={styles.input}
                keyboardType="email-address"
                outlineColor="#ddd"
                activeOutlineColor="#3E92CC"
                left={<TextInput.Icon icon="email" color="#3E92CC" />}
                theme={{ colors: { primary: '#3E92CC', text: '#333' } }}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                mode="outlined"
                value={editFormData.contact_no}
                onChangeText={(text) => setEditFormData(prev => ({ ...prev, contact_no: text }))}
                style={styles.input}
                keyboardType="phone-pad"
                outlineColor="#ddd"
                activeOutlineColor="#3E92CC"
                left={<TextInput.Icon icon="phone" color="#3E92CC" />}
                theme={{ colors: { primary: '#3E92CC', text: '#333' } }}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Gender</Text>
              <TextInput
                mode="outlined"
                value={editFormData.gender}
                onChangeText={(text) => setEditFormData(prev => ({ ...prev, gender: text }))}
                style={styles.input}
                outlineColor="#ddd"
                activeOutlineColor="#3E92CC"
                left={<TextInput.Icon icon="human-male-female" color="#3E92CC" />}
                theme={{ colors: { primary: '#3E92CC', text: '#333' } }}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Age</Text>
              <TextInput
                mode="outlined"
                value={editFormData.age}
                onChangeText={(text) => setEditFormData(prev => ({ ...prev, age: text }))}
                style={styles.input}
                keyboardType="numeric"
                outlineColor="#ddd"
                activeOutlineColor="#3E92CC"
                left={<TextInput.Icon icon="calendar" color="#3E92CC" />}
                theme={{ colors: { primary: '#3E92CC', text: '#333' } }}
              />
            </View>

            <TouchableOpacity 
              style={styles.saveButton} 
              onPress={handleUpdateProfile}
            >
              <Icon name="content-save" size={22} color="#fff" style={styles.saveIcon} />
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  loadingText: {
    fontSize: 16,
    color: '#3E92CC',
  },
  header: {
    paddingTop: 30,
    paddingBottom: 120,
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
  profileHeader: {
    alignItems: 'center',
    paddingTop: 10,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: 'white',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#16DB93',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  userType: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  contentContainer: {
    marginTop: -60,
    paddingHorizontal: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#eee',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3E92CC',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    paddingHorizontal: 5,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoIcon: {
    width: 40,
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
    marginLeft: 10,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginTop: 2,
  },
  actionsContainer: {
    marginBottom: 30,
  },
  actionButton: {
    marginBottom: 15,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  buttonIcon: {
    marginRight: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
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
  modalContent: {
    flex: 1,
    padding: 20,
  },
  editAvatarContainer: {
    alignItems: 'center',
    marginBottom: 30,
    position: 'relative',
  },
  editAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'white',
  },
  editCameraButton: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    backgroundColor: '#16DB93',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  inputGroup: {
    marginBottom: 16,
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
  saveButton: {
    backgroundColor: '#3E92CC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 30,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  saveIcon: {
    marginRight: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AccountScreen;