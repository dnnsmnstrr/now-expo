import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useNowPage } from '../../hooks/NowContext';
import { Text, View, TouchableOpacity, Modal, Platform, ActivityIndicator, ScrollView, Alert, useColorScheme } from 'react-native';
import { formatDistanceToNow, format, differenceInDays } from 'date-fns';
import { useState } from 'react';
import { Colors } from '../../constants/Colors';

const OUTDATED_WARNING_DAYS = 30;

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const { data, refresh, versionHistory, loadVersion, selectedVersion } = useNowPage();
  const [showTimestamp, setShowTimestamp] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedVersionUrl, setSelectedVersionUrl] = useState<string | null>(null);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await refresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleVersionSelect = async (versionUrl: string) => {
    setSelectedVersionUrl(versionUrl);
    await loadVersion(versionUrl);
    setShowTimestamp(false);
  };

  const handleRevert = async () => {
    if (!selectedVersionUrl) return;

    Alert.alert(
      'Revert to Version',
      'Are you sure you want to revert to this version? This will update your now page to match this version.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Revert',
          style: 'destructive',
          onPress: async () => {
            try {
              await loadVersion(selectedVersionUrl);
              setSelectedVersionUrl(null);
            } catch (error) {
              Alert.alert('Error', 'Failed to revert to selected version');
            }
          },
        },
      ]
    );
  };

  const handleViewCurrent = async () => {
    setSelectedVersionUrl(null);
    await refresh();
    setShowTimestamp(false);
  };

  const formatDate = (date: Date) => {
    return format(date, 'MMM d, h:mm a');
  };

  const now = new Date()
  const isTimestampOneMonthAgo = differenceInDays(now, data?.updatedAt || now) > OUTDATED_WARNING_DAYS;

  const selectedVersionData = selectedVersionUrl 
    ? versionHistory?.find(v => v.url === selectedVersionUrl)
    : null;

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarStyle: {
            backgroundColor: theme.cardBackground,
            borderTopWidth: 1,
            borderTopColor: theme.border,
          },
          tabBarActiveTintColor: theme.tint,
          tabBarInactiveTintColor: theme.tabIconDefault,
          headerStyle: {
            backgroundColor: theme.cardBackground,
          },
          headerShadowVisible: false,
          headerTitleStyle: {
            color: theme.text,
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: '',
            tabBarIcon: ({ size, color }) => (
              <Ionicons name="time-outline" size={size} color={color} />
            ),
            headerLeft: () => (
              data?.updatedAt ? (
                <TouchableOpacity 
                  onPress={() => setShowTimestamp(true)}
                  style={{ marginLeft: 16 }}
                >
                  {selectedVersionData ? (
                    <Text style={{ color: theme.tint, fontSize: 12 }}>
                      Version from {formatDate(new Date(selectedVersionData.committed_at))}
                    </Text>
                  ) : (
                    <Text style={{ color: isTimestampOneMonthAgo ? theme.error : theme.secondaryText, fontSize: 12 }}>
                      Updated {formatDistanceToNow(data.updatedAt, { addSuffix: true })}
                    </Text>
                  )}
                </TouchableOpacity>
              ) : null
            ),
            headerRight: () => (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}>
                {selectedVersionUrl && (
                  <TouchableOpacity 
                    onPress={handleRevert}
                    style={{
                      backgroundColor: theme.tint,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 6,
                      marginRight: 16,
                    }}
                  >
                    <Text style={{ color: 'white', fontSize: 14, fontWeight: '500' }}>
                      Revert
                    </Text>
                  </TouchableOpacity>
                )}
                {Platform.OS === 'web' && (
                  <TouchableOpacity 
                    onPress={handleRefresh}
                    disabled={isRefreshing}
                  >
                    {isRefreshing ? (
                      <ActivityIndicator size="small" color={theme.tint} />
                    ) : (
                      <Ionicons name="refresh" size={24} color={theme.tint} />
                    )}
                  </TouchableOpacity>
                )}
              </View>
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
        onRequestClose={() => {
          setShowTimestamp(false);
          setSelectedVersionUrl(null);
        }}
      >
        <TouchableOpacity 
          style={{ 
            flex: 1, 
            backgroundColor: theme.modalOverlay,
            justifyContent: 'center',
            alignItems: 'center'
          }}
          activeOpacity={1}
          onPress={() => {
            setShowTimestamp(false);
            setSelectedVersionUrl(null);
          }}
        >
          <View style={{ 
            backgroundColor: theme.cardBackground,
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
            maxWidth: '90%',
            maxHeight: '80%',
            position: 'absolute',
            top: 50,
            left: 10,
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: theme.text }}>
                Version History
              </Text>
            </View>
            <ScrollView style={{ maxHeight: 400 }}>
              {selectedVersionUrl && (
                <TouchableOpacity 
                  onPress={handleViewCurrent}
                  style={{
                    backgroundColor: theme.background,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    marginBottom: 16,
                    borderRadius: 6,
                  }}
                >
                  <Text style={{ color: theme.secondaryText, fontSize: 14, fontWeight: '500' }}>
                    Current Version
                  </Text>
                </TouchableOpacity>
              )}
              {versionHistory?.map((version, index) => (
                <TouchableOpacity
                  key={version.version}
                  onPress={() => handleVersionSelect(version.url)}
                  style={{ 
                    marginBottom: 16,
                    paddingBottom: 16,
                    borderBottomWidth: index === versionHistory.length - 1 ? 0 : 1,
                    borderBottomColor: theme.border,
                      backgroundColor: selectedVersionUrl === version.url ? theme.selectedItem : 'transparent',
                    padding: 12,
                    borderRadius: 8,
                  }}
                >
                  <Text style={{ fontSize: 14, color: theme.secondaryText, marginBottom: 4 }}>
                    {formatDate(new Date(version.committed_at))}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontSize: 12, color: theme.tint, marginRight: 8 }}>
                      {version.version.substring(0, 7)}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      {version.change_status.additions > 0 && (
                        <Text style={{ fontSize: 12, color: '#28a745', marginRight: 8 }}>
                          +{version.change_status.additions}
                        </Text>
                      )}
                      {version.change_status.deletions > 0 && (
                        <Text style={{ fontSize: 12, color: theme.error }}>
                          -{version.change_status.deletions}
                        </Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={{ textAlign: 'center', opacity: 0.4, color: theme.text }}>{versionHistory?.length || 0} Updates</Text>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}