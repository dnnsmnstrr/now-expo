import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useNowPage } from '../../hooks/useNowPage';
import { NowPageData } from '../../types/now-page';
import { Ionicons } from '@expo/vector-icons';

export default function NowScreen() {
  const { data, loading, error, refresh } = useNowPage();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const navigateToEdit = (section?: string) => {
    router.push({
      pathname: '/edit',
      params: { section }
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  if (loading && !refreshing) {
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
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#007AFF"
          colors={["#007AFF"]}
        />
      }
    >
      <View style={styles.content}>
        {data?.status && (
          <TouchableOpacity onPress={() => navigateToEdit('status')} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="information-circle-outline" size={24} color="#007AFF" />
              <Text style={styles.sectionTitle}>Status</Text>
            </View>
            <Text style={styles.text}>{data.status}</Text>
          </TouchableOpacity>
        )}

        {data?.location && (
          <TouchableOpacity onPress={() => navigateToEdit('location')} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="location-outline" size={24} color="#007AFF" />
              <Text style={styles.sectionTitle}>Location</Text>
            </View>
            <Text style={styles.text}>{data.location}</Text>
          </TouchableOpacity>
        )}

        {data?.playlist && (
          <TouchableOpacity onPress={() => navigateToEdit('playlist')} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="musical-notes-outline" size={24} color="#007AFF" />
              <Text style={styles.sectionTitle}>Current Playlist</Text>
            </View>
            <Text style={styles.text}>{data.playlist.name}</Text>
          </TouchableOpacity>
        )}

        {data?.activities && data.activities.length > 0 && (
          <TouchableOpacity onPress={() => navigateToEdit('activities')} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="checkmark-circle-outline" size={24} color="#007AFF" />
              <Text style={styles.sectionTitle}>Recent Activities</Text>
            </View>
            {data.activities.map((activity, index) => (
              <Text key={index} style={styles.listItem}>• {activity}</Text>
            ))}
          </TouchableOpacity>
        )}

        {data?.plans && data.plans.length > 0 && (
          <TouchableOpacity onPress={() => navigateToEdit('plans')} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="calendar-outline" size={24} color="#007AFF" />
              <Text style={styles.sectionTitle}>Upcoming Plans</Text>
            </View>
            {data.plans.map((plan, index) => (
              <Text key={index} style={styles.listItem}>• {plan}</Text>
            ))}
          </TouchableOpacity>
        )}

        {data?.projects && data.projects.length > 0 && (
          <TouchableOpacity onPress={() => navigateToEdit('projects')} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="construct-outline" size={24} color="#007AFF" />
              <Text style={styles.sectionTitle}>Projects</Text>
            </View>
            {data.projects.map((project, index) => (
              <Text key={index} style={styles.listItem}>• {project}</Text>
            ))}
          </TouchableOpacity>
        )}

        {/* Render custom fields */}
        {Object.entries(data || {}).map(([key, value]) => {
          if (!['status', 'playlist', 'activities', 'plans', 'projects', 'location'].includes(key)) {
            // Capitalize the first letter of each word in the key
            const capitalizedKey = key
              .split(' ')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');

            return (
              <TouchableOpacity key={key} onPress={() => navigateToEdit(key)} style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
                  <Text style={styles.sectionTitle}>{capitalizedKey}</Text>
                </View>
                {Array.isArray(value) ? (
                  value.map((item, index) => (
                    <Text key={index} style={styles.listItem}>• {item}</Text>
                  ))
                ) : typeof value === 'object' && value !== null ? (
                  Object.entries(value).map(([k, v]) => (
                    <Text key={k} style={styles.text}>{k}: {String(v)}</Text>
                  ))
                ) : (
                  <Text style={styles.text}>{String(value)}</Text>
                )}
              </TouchableOpacity>
            );
          }
          return null;
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