import { View, Text, ScrollView, StyleSheet, Linking } from 'react-native';
import { useEffect, useState } from 'react';
import { useNowPage } from '../../hooks/useNowPage';
import { NowPageData } from '../../types/now-page';
import { Ionicons } from '@expo/vector-icons';

export default function NowScreen() {
  const { data, loading, error } = useNowPage();

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {data?.status && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="information-circle-outline" size={24} color="#007AFF" />
              <Text style={styles.sectionTitle}>Status</Text>
            </View>
            <Text style={styles.text}>{data.status}</Text>
          </View>
        )}

        {data?.location && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="location-outline" size={24} color="#007AFF" />
              <Text style={styles.sectionTitle}>Location</Text>
            </View>
            <Text style={styles.text}>{data.location}</Text>
          </View>
        )}

        {data?.playlist && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="musical-notes-outline" size={24} color="#007AFF" />
              <Text style={styles.sectionTitle}>Current Playlist</Text>
            </View>
            <Text style={styles.text}>{data.playlist.name}</Text>
          </View>
        )}

        {data?.activities && data.activities.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="checkmark-circle-outline" size={24} color="#007AFF" />
              <Text style={styles.sectionTitle}>Recent Activities</Text>
            </View>
            {data.activities.map((activity, index) => (
              <Text key={index} style={styles.listItem}>• {activity}</Text>
            ))}
          </View>
        )}

        {data?.plans && data.plans.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="calendar-outline" size={24} color="#007AFF" />
              <Text style={styles.sectionTitle}>Upcoming Plans</Text>
            </View>
            {data.plans.map((plan, index) => (
              <Text key={index} style={styles.listItem}>• {plan}</Text>
            ))}
          </View>
        )}

        {data?.projects && data.projects.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="construct-outline" size={24} color="#007AFF" />
              <Text style={styles.sectionTitle}>Projects</Text>
            </View>
            {data.projects.map((project, index) => (
              <Text key={index} style={styles.listItem}>• {project}</Text>
            ))}
          </View>
        )}

        {/* Render custom fields */}
        {Object.entries(data || {}).map(([key, value]) => {
          if (!['status', 'playlist', 'activities', 'plans', 'projects', 'location'].includes(key)) {
            return (
              <View key={key} style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
                  <Text style={styles.sectionTitle}>{key}</Text>
                </View>
                {Array.isArray(value) ? (
                  value.map((item, index) => (
                    <Text key={index} style={styles.listItem}>• {item}</Text>
                  ))
                ) : typeof value === 'object' ? (
                  Object.entries(value).map(([k, v]) => (
                    <Text key={k} style={styles.text}>{k}: {v}</Text>
                  ))
                ) : (
                  <Text style={styles.text}>{value}</Text>
                )}
              </View>
            );
          }
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    color: '#1a1a1a',
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4a4a4a',
  },
  listItem: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
    color: '#4a4a4a',
  },
  error: {
    color: '#dc3545',
    textAlign: 'center',
    marginTop: 20,
  },
});