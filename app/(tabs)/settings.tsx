import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Linking, TextInput, ActivityIndicator } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useNowPage } from '../../hooks/useNowPage';
import { useGistContext } from '../../hooks/GistContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const { isAuthenticated, login, logout, user, token } = useAuth();
  const { currentGistId, gists, loading, error, fetchGists, createGist, selectGist } = useGistContext();
  const [authToken, setAuthToken] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchGists(token);
    }
  }, [isAuthenticated, token]);

  const handleLogin = async () => {
    try {
      await login(authToken);
      setAuthToken('');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to login. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  const handleCreateGist = async () => {
    try {
      if (!token) return;
      await createGist(token);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Error', 'Failed to create gist. Please try again.');
    }
  };

  const handleSelectGist = async (gistId: string) => {
    try {
      await selectGist(gistId);
      // router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Error', 'Failed to select gist. Please try again.');
    }
  };

  const renderGistSelection = () => {
    if (loading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.section}>
          <Text style={styles.error}>{error}</Text>
          <TouchableOpacity
            style={[styles.button, styles.retryButton]}
            onPress={() => token && fetchGists(token)}>
            <Text style={styles.buttonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (gists.length === 0) {
      return (
        <View style={styles.section}>
          <Text style={styles.description}>
            No now.json gist found. Create one to get started with your now page.
          </Text>
          <TouchableOpacity
            style={[styles.button, styles.createButton]}
            onPress={handleCreateGist}>
            <Text style={styles.buttonText}>Create Now Page Gist</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Now Page Gist</Text>
        {gists.map(gist => (
          <TouchableOpacity
            key={gist.id}
            style={[
              styles.gistItem,
              currentGistId === gist.id && styles.selectedGist,
            ]}
            onPress={() => handleSelectGist(gist.id)}>
            <Ionicons
              name={currentGistId === gist.id ? 'radio-button-on' : 'radio-button-off'}
              size={24}
              color="#007AFF"
            />
            <View style={styles.gistInfo}>
              <Text style={styles.gistDescription}>
                {gist.description || 'No description'}
              </Text>
              <Text style={styles.gistId}>ID: {gist.id}</Text>
            </View>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[styles.button, styles.createButton]}
          onPress={handleCreateGist}>
          <Text style={styles.buttonText}>Create Another Gist</Text>
        </TouchableOpacity>
      </View>
    );
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
          <View>
            <Text style={styles.description}>
              Enter your GitHub personal access token to manage your now page.
              The token needs 'gist' scope to read and write your now page data.
            </Text>
            <TouchableOpacity
              onPress={() => Linking.openURL('https://github.com/settings/tokens/new')}
              style={styles.link}>
              <Text style={styles.linkText}>Create a new token</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              value={authToken}
              onChangeText={setAuthToken}
              placeholder="Enter GitHub token"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={[styles.button, styles.loginButton]}
              onPress={handleLogin}>
              <Text style={styles.buttonText}>Login with Token</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {isAuthenticated && renderGistSelection()}

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
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
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
    marginTop: 12,
  },
  logoutButton: {
    backgroundColor: '#dc3545',
  },
  createButton: {
    backgroundColor: '#007AFF',
    marginTop: 12,
  },
  retryButton: {
    backgroundColor: '#6c757d',
    marginTop: 12,
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
  input: {
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  error: {
    color: '#dc3545',
    fontSize: 16,
    marginBottom: 16,
  },
  gistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedGist: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f9ff',
  },
  gistInfo: {
    marginLeft: 12,
    flex: 1,
  },
  gistDescription: {
    fontSize: 16,
    color: '#1a1a1a',
    marginBottom: 4,
  },
  gistId: {
    fontSize: 14,
    color: '#6c757d',
  },
});