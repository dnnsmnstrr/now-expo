import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Linking } from 'react-native';
import { useAuth } from '../../hooks/useAuth';

export default function SettingsScreen() {
  const { isAuthenticated, login, logout, user } = useAuth();

  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      Alert.alert('Error', 'Failed to login. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>GitHub Account</Text>
        {isAuthenticated ? (
          <>
            <Text style={styles.userInfo}>Logged in as: {user?.login}</Text>
            <TouchableOpacity
              style={[styles.button, styles.logoutButton]}
              onPress={handleLogout}>
              <Text style={styles.buttonText}>Logout</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.loginButton]}
            onPress={handleLogin}>
            <Text style={styles.buttonText}>Login with GitHub</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.description}>
          This app helps you maintain a "now page" - a place to share what you're currently focused on,
          your recent activities, and upcoming plans. The data is stored in a GitHub Gist, making it
          easy to integrate with other platforms.
        </Text>
        <TouchableOpacity
          onPress={() => Linking.openURL('https://nownownow.com/about')}
          style={styles.link}>
          <Text style={styles.linkText}>Learn more about now pages</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    color: '#1a1a1a',
  },
  userInfo: {
    fontSize: 16,
    marginBottom: 16,
    color: '#4a4a4a',
  },
  button: {
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  loginButton: {
    backgroundColor: '#2ea44f',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4a4a4a',
    marginBottom: 16,
  },
  link: {
    padding: 8,
  },
  linkText: {
    color: '#007AFF',
    fontSize: 16,
  },
});