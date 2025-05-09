import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useNowPage } from '../../hooks/NowContext';
import { Text, View, TouchableOpacity, Modal, Platform, ActivityIndicator } from 'react-native';
import { formatDistanceToNow, format, differenceInDays } from 'date-fns';
import { useState } from 'react';

const OUTDATED_WARNING_DAYS = 30;
export default function TabLayout() {
  const { data, refresh } = useNowPage();
  const [showTimestamp, setShowTimestamp] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await refresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatDate = (date: Date) => {
    return format(date, 'MMM d, h:mm a');
  };

  const now = new Date()
  const isTimestampOneMonthAgo = differenceInDays(now, data?.updatedAt || now) > OUTDATED_WARNING_DAYS;
  return (
    <>
      <Tabs
        screenOptions={{
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopWidth: 1,
            borderTopColor: '#e5e5e5',
          },
          tabBarActiveTintColor: '#007AFF',
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerShadowVisible: false,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Now',
            tabBarIcon: ({ size, color }) => (
              <Ionicons name="time-outline" size={size} color={color} />
            ),
            headerLeft: () => (
              data?.updatedAt ? (
                <TouchableOpacity 
                  onPress={() => setShowTimestamp(true)}
                  style={{ marginLeft: 16 }}
                >
                  <Text style={{ color: isTimestampOneMonthAgo ? '#FF0000' : '#666', fontSize: 12 }}>
                    Updated {formatDistanceToNow(data.updatedAt, { addSuffix: true })}
                  </Text>
                </TouchableOpacity>
              ) : null
            ),
            headerRight: () => (
              Platform.OS === 'web' ? (
                <TouchableOpacity 
                  onPress={handleRefresh}
                  disabled={isRefreshing}
                  style={{ marginRight: 16 }}
                >
                  {isRefreshing ? (
                    <ActivityIndicator size="small" color="#007AFF" />
                  ) : (
                    <Ionicons name="refresh" size={24} color="#007AFF" />
                  )}
                </TouchableOpacity>
              ) : null
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ size, color }) => (
              <Ionicons name="settings-outline" size={size} color={color} />
            ),
          }}
        />
      </Tabs>

      <Modal
        visible={showTimestamp}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowTimestamp(false)}
      >
        <TouchableOpacity 
          style={{ 
            flex: 1, 
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center'
          }}
          activeOpacity={1}
          onPress={() => setShowTimestamp(false)}
        >
          <View style={{ 
            backgroundColor: 'white', 
            padding: 20, 
            borderRadius: 10,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}>
            <Text style={{ fontSize: 16, color: '#333' }}>
              {data?.updatedAt ? formatDate(data.updatedAt) : ''}
            </Text>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}