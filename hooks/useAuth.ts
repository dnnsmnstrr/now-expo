import { useState, useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

const GITHUB_CLIENT_ID = process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID;
const discovery = {
  authorizationEndpoint: 'https://github.com/login/oauth/authorize',
  tokenEndpoint: 'https://github.com/login/oauth/access_token',
  revocationEndpoint: 'https://github.com/settings/connections/applications/' + GITHUB_CLIENT_ID,
};

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  const redirectUri = makeRedirectUri({
    scheme: Platform.select({
      web: 'http://localhost:8081',
      default: 'your-app-scheme'
    }),
    path: Platform.select({
      web: '',
      default: 'oauth'
    })
  });

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: GITHUB_CLIENT_ID!,
      scopes: ['gist'],
      redirectUri,
    },
    discovery
  );

  useEffect(() => {
    AsyncStorage.getItem('github_token').then(savedToken => {
      if (savedToken) {
        setToken(savedToken);
        fetchUser(savedToken);
      }
    });
  }, []);

  useEffect(() => {
    if (response?.type === 'success') {
      const { code } = response.params;
      exchangeCodeForToken(code);
    }
  }, [response]);

  const exchangeCodeForToken = async (code: string) => {
    try {
      // In a real app, you would exchange the code for a token using your backend
      // For demo purposes, we'll simulate getting a token
      const simulatedToken = 'demo_token_' + code;
      await AsyncStorage.setItem('github_token', simulatedToken);
      setToken(simulatedToken);
      await fetchUser(simulatedToken);
    } catch (error) {
      console.error('Error exchanging code for token:', error);
    }
  };

  const fetchUser = async (accessToken: string) => {
    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `token ${accessToken}`,
        },
      });
      const userData = await response.json();
      setUser(userData);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const login = async () => {
    await promptAsync();
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