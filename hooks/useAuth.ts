import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    AsyncStorage.getItem('github_token').then(savedToken => {
      if (savedToken) {
        setToken(savedToken);
        fetchUser(savedToken);
      }
    });
  }, []);

  const fetchUser = async (accessToken: string) => {
    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!response.ok) {
        throw new Error('Invalid token');
      }
      const userData = await response.json();
      setUser(userData);
    } catch (error) {
      console.error('Error fetching user data:', error);
      await logout();
    }
  };

  const login = async (apiKey: string) => {
    try {
      // Verify the token is valid by attempting to fetch user data
      const response = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Invalid token');
      }

      const userData = await response.json();
      await AsyncStorage.setItem('github_token', apiKey);
      setToken(apiKey);
      setUser(userData);
    } catch (error) {
      console.error('Error validating token:', error);
      throw new Error('Invalid GitHub token. Please check your token and try again.');
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('github_token');
    setToken(null);
    setUser(null);
  };

  return {
    isAuthenticated: !!token,
    token,
    user,
    login,
    logout,
  };
}