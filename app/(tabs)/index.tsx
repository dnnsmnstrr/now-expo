import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, ActivityIndicator, Button, Platform } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useNowPage } from '../../hooks/NowContext';
import { useGistContext } from '../../hooks/GistContext';
import { Ionicons } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';

export default function NowScreen() {
  const { data, loading, error, refresh } = useNowPage();
  const { currentGistId } = useGistContext();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const navigateToEdit = (section: string, value: any) => {
    router.push({
      pathname: '/edit',
      params: { 
        section,
        initialValue: typeof value === 'object' ? JSON.stringify(value) : String(value || '')
      }
    });
  };

  const addNewField = () => {
    router.push({
      pathname: '/new-field',
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    console.log(console.log(JSON.stringify(data, null, 4)))
    setRefreshing(false);
  };

  useEffect(() => {
    onRefresh()
  }, [currentGistId])

  if (!currentGistId) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>No ID selected. Please go to settings to select an ID.</Text>
        <Button title="Go to Settings" onPress={() => router.push('/settings')} />
      </View>
    );
  }
  
  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
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
          <TouchableOpacity onPress={() => navigateToEdit('status', data.status)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="information-circle-outline" size={24} color="#007AFF" />
              <Text style={styles.sectionTitle}>Status</Text>
            </View>
            <Markdown style={markdownStyles}>{data.status}</Markdown>
          </TouchableOpacity>
        )}

        {data?.location && (
          <TouchableOpacity onPress={() => navigateToEdit('location', data.location)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="location-outline" size={24} color="#007AFF" />
              <Text style={styles.sectionTitle}>Location</Text>
            </View>
            <Text style={styles.text}>{data.location}</Text>
          </TouchableOpacity>
        )}

        {data?.playlist && (
          <TouchableOpacity onPress={() => navigateToEdit('playlist', data.playlist)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="musical-notes-outline" size={24} color="#007AFF" />
              <Text style={styles.sectionTitle}>Current Playlist</Text>
            </View>
            <Text style={styles.text}>{data.playlist.name}</Text>
          </TouchableOpacity>
        )}

        {data?.activities && data.activities.length > 0 && (
          <TouchableOpacity onPress={() => navigateToEdit('activities', data.activities)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="checkmark-circle-outline" size={24} color="#007AFF" />
              <Text style={styles.sectionTitle}>Recent Activities</Text>
            </View>
            <Markdown style={markdownStyles}>
              {data.activities.map((activity, index) => `- ${activity}`).join('\n')}
            </Markdown>
          </TouchableOpacity>
        )}

        {data?.plans && data.plans.length > 0 && (
          <TouchableOpacity onPress={() => navigateToEdit('plans', data.plans)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="calendar-outline" size={24} color="#007AFF" />
              <Text style={styles.sectionTitle}>Upcoming Plans</Text>
            </View>
            <Markdown style={markdownStyles}>
              {data.plans.map((plan, index) => `- ${plan}`).join('\n')}
            </Markdown>
          </TouchableOpacity>
        )}

        {data?.projects && data.projects.length > 0 && (
          <TouchableOpacity onPress={() => navigateToEdit('projects', data.projects)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="construct-outline" size={24} color="#007AFF" />
              <Text style={styles.sectionTitle}>Projects</Text>
            </View>
            <Markdown style={markdownStyles}>
              {data.projects.map((project, index) => `- ${project}`).join('\n')}
            </Markdown>
          </TouchableOpacity>
        )}

        {/* Render custom fields */}
        {Object.entries(data || {}).map(([key, value]) => {
          if (!['updatedAt', 'status', 'playlist', 'activities', 'plans', 'projects', 'location'].includes(key)) {
            // Capitalize the first letter of each word in the key
            const capitalizedKey = key
              .split(' ')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');

            return (
              <TouchableOpacity key={key} onPress={() => navigateToEdit(key, value)} style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
                  <Text style={styles.sectionTitle}>{capitalizedKey}</Text>
                </View>
                {Array.isArray(value) ? (
                  <Markdown style={markdownStyles}>
                    {value.map((item, index) => `- ${item}`).join('\n')}
                  </Markdown>
                ) : typeof value === 'object' && value !== null ? (
                  <Markdown style={markdownStyles}>
                    {Object.entries(value).map(([k, v]) => `**${k}:** ${String(v)}`).join('\n')}
                  </Markdown>
                ) : (
                  <Markdown style={markdownStyles}>
                    {String(value)}
                  </Markdown>
                )}
              </TouchableOpacity>
            );
          }
          return null;
        })}

        <TouchableOpacity onPress={addNewField} style={styles.addButton}>
          <View style={styles.addButtonContent}>
            <Ionicons name="add-circle-outline" size={20} color="#007AFF" />
            <Text style={styles.addButtonText}>Add New Field</Text>
          </View>
        </TouchableOpacity>
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
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  addButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
    color: '#007AFF',
  },
});

const markdownStyles = {
  body: {
    color: '#4a4a4a',
    fontSize: 16,
    lineHeight: 24,
  },
  // paragraph: {
  //   color: '#4a4a4a',
  //   fontSize: 16,
  //   lineHeight: 24,
  // },
  heading1: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1a1a1a',
  },
  heading2: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1a1a1a',
  },
  heading3: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1a1a1a',
  },
  link: {
    color: '#007AFF',
  },
  list_item: {
    marginBottom: 8,
  },
  bullet_list: {
    marginBottom: 16,
  },
  ordered_list: {
    marginBottom: 16,
  },
  code_inline: {
    backgroundColor: '#f0f0f0',
    padding: 4,
    borderRadius: 4,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  code_block: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  blockquote: {
    borderLeftWidth: 4,
    borderLeftColor: '#e0e0e0',
    paddingLeft: 16,
    marginLeft: 0,
    marginBottom: 16,
  },
};