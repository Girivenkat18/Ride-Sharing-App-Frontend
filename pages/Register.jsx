import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  SafeAreaView,
  Alert
} from 'react-native';
import { TextInput } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import authService from '../services/authService';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

const Register = ({ navigation }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    contact_no: '',
    gender: '',
    age: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.full_name || !formData.email || !formData.password || 
        !formData.contact_no || !formData.gender || !formData.age) {
      Alert.alert('Error', 'Please fill all fields.');
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return false;
    }

    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long.');
      return false;
    }

    if (!/^\d{10}$/.test(formData.contact_no)) {
      Alert.alert('Error', 'Please enter a valid 10-digit contact number.');
      return false;
    }

    const age = parseInt(formData.age);
    if (isNaN(age) || age < 18 || age > 100) {
      Alert.alert('Error', 'Please enter a valid age between 18 and 100.');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const userData = {
        ...formData,
        age: parseInt(formData.age)
      };

      await authService.register(userData);
      console.log('Registration successful');

      Alert.alert(
        'Success', 
        'Registration successful. Please log in with your credentials.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error) {
      console.error('Registration error:', error);
      
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response?.data?.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response?.data?.error;
      }

      Alert.alert(
        'Registration Failed', 
        errorMessage
      );
    } finally {
      setLoading(false);
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
          <Text style={styles.headerTitle}>Create Account</Text>
          <Text style={styles.headerSubtitle}>Join our ride-sharing community</Text>
        </LinearGradient>

        <View style={styles.formContainer}>
          <View style={styles.inputWrapper}>
            <Icon name="account-outline" size={22} color="#3E92CC" style={styles.inputIcon} />
            <TextInput
              mode="flat"
              label="Full Name"
              placeholder="Enter your full name"
              value={formData.full_name}
              onChangeText={(value) => handleChange('full_name', value)}
              style={styles.input}
              underlineColor="transparent"
              activeUnderlineColor="#3E92CC"
              theme={{ colors: { primary: '#3E92CC', text: '#333' } }}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Icon name="email-outline" size={22} color="#3E92CC" style={styles.inputIcon} />
            <TextInput
              mode="flat"
              label="Email"
              placeholder="Enter your email"
              value={formData.email}
              onChangeText={(value) => handleChange('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              underlineColor="transparent"
              activeUnderlineColor="#3E92CC"
              theme={{ colors: { primary: '#3E92CC', text: '#333' } }}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Icon name="lock-outline" size={22} color="#3E92CC" style={styles.inputIcon} />
            <TextInput
              mode="flat"
              label="Password"
              placeholder="Create a password"
              value={formData.password}
              onChangeText={(value) => handleChange('password', value)}
              secureTextEntry
              style={styles.input}
              underlineColor="transparent"
              activeUnderlineColor="#3E92CC"
              theme={{ colors: { primary: '#3E92CC', text: '#333' } }}
              right={<TextInput.Icon icon="eye" color="#666" />}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Icon name="phone-outline" size={22} color="#3E92CC" style={styles.inputIcon} />
            <TextInput
              mode="flat"
              label="Contact Number"
              placeholder="Enter your phone number"
              value={formData.contact_no}
              onChangeText={(value) => handleChange('contact_no', value)}
              keyboardType="phone-pad"
              style={styles.input}
              underlineColor="transparent"
              activeUnderlineColor="#3E92CC"
              theme={{ colors: { primary: '#3E92CC', text: '#333' } }}
            />
          </View>

          <Text style={styles.inputLabel}>Gender</Text>
          <View style={styles.pickerContainer}>
            <Icon name="gender-male-female" size={22} color="#3E92CC" style={styles.pickerIcon} />
            <Picker
              selectedValue={formData.gender}
              onValueChange={(value) => handleChange('gender', value)}
              style={styles.picker}
            >
              <Picker.Item label="Select Gender" value="" />
              <Picker.Item label="Male" value="MALE" />
              <Picker.Item label="Female" value="FEMALE" />
              <Picker.Item label="Other" value="OTHER" />
            </Picker>
          </View>

          <View style={styles.inputWrapper}>
            <Icon name="calendar-outline" size={22} color="#3E92CC" style={styles.inputIcon} />
            <TextInput
              mode="flat"
              label="Age"
              placeholder="Enter your age"
              value={formData.age}
              onChangeText={(value) => handleChange('age', value)}
              keyboardType="numeric"
              style={styles.input}
              underlineColor="transparent"
              activeUnderlineColor="#3E92CC"
              theme={{ colors: { primary: '#3E92CC', text: '#333' } }}
            />
          </View>

          <TouchableOpacity
            style={loading ? styles.loadingButton : styles.registerButton}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Icon name="account-plus" size={20} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Create Account</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginText}>Already have an account? <Text style={styles.loginLink}>Sign In</Text></Text>
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
    paddingTop: 50,
    paddingBottom: 70,
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
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  headerSubtitle: {
    fontSize: 18,
    color: '#fff',
    opacity: 0.9,
  },
  formContainer: {
    marginTop: -40,
    paddingHorizontal: 20,
    paddingVertical: 25,
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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginBottom: 15,
  },
  inputIcon: {
    marginRight: 8,
    marginTop: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    height: 55,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    marginLeft: 2,
    marginTop: 5,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    height: 55,
    marginBottom: 15,
    backgroundColor: '#fff',
    paddingHorizontal: 8,
  },
  pickerIcon: {
    marginRight: 8,
  },
  picker: {
    flex: 1,
    height: 55,
  },
  registerButton: {
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
    marginTop: 15,
  },
  loadingButton: {
    backgroundColor: '#90EE90',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginText: {
    marginTop: 20,
    textAlign: 'center',
    color: '#666',
    fontSize: 15,
  },
  loginLink: {
    color: '#3E92CC',
    fontWeight: 'bold',
  }
});

export default Register;