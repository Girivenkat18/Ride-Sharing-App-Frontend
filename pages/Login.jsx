import React, { useState, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  StatusBar,
  SafeAreaView
} from 'react-native';
import { TextInput } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigation = useNavigation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const validateInput = () => {
    if (!email) {
      Alert.alert('Validation Error', 'Email is required');
      return false;
    }
    if (!password) {
      Alert.alert('Validation Error', 'Password is required');
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (!validateInput()) return;
    
    setLoading(true);
    try {
      console.log('Attempting login with:', { email, password: '****' });
      await login({ email, password });
      console.log('Login successful');
      navigation.navigate('Main');
    } catch (error) {
      console.error('Login error:', {
        message: error.message,
        response: error.response?.data
      });
      Alert.alert(
        'Login Error', 
        error.response?.data?.message || error.message || 'Invalid credentials'
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
          <Text style={styles.headerTitle}>Welcome Back</Text>
          <Text style={styles.headerSubtitle}>Sign in to continue</Text>
        </LinearGradient>

        <View style={styles.formContainer}>
          <View style={styles.inputWrapper}>
            <Icon name="email-outline" size={22} color="#3E92CC" style={styles.inputIcon} />
            <TextInput
              mode="flat"
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
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
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
              underlineColor="transparent"
              activeUnderlineColor="#3E92CC"
              theme={{ colors: { primary: '#3E92CC', text: '#333' } }}
              right={<TextInput.Icon icon="eye" color="#666" />}
            />
          </View>

          <TouchableOpacity 
            style={loading ? styles.loadingButton : styles.loginButton} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Icon name="login" size={20} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Sign In</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerText}>Don't have an account? <Text style={styles.registerLink}>Register</Text></Text>
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
    paddingTop: 60,
    paddingBottom: 80,
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
    paddingVertical: 30,
    backgroundColor: '#fff',
    marginHorizontal: 15,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginBottom: 20,
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
  loginButton: {
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
    marginTop: 20,
  },
  loadingButton: {
    backgroundColor: '#90CAF9',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerText: {
    marginTop: 20,
    textAlign: 'center',
    color: '#666',
    fontSize: 15,
  },
  registerLink: {
    color: '#3E92CC',
    fontWeight: 'bold',
  }
});

export default Login;