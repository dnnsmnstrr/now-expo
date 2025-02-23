import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNowPage } from '../../hooks/useNowPage';
import { Ionicons } from '@expo/vector-icons';
import { NowPageData, FieldType } from '../../types/now-page';

export default function EditScreen() {
  const { data, loading, error, updateData } = useNowPage();
  const [localData, setLocalData] = useState<NowPageData>(data || {});
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState<FieldType>('string');

  const handleSave = async () => {
    try {
      await updateData(localData);
      Alert.alert('Success', 'Your now page has been updated!');
    } catch (err) {
      Alert.alert('Error', 'Failed to update your now page. Please try again.');
    }
  };

  const handleAddField = () => {
    if (!newFieldName.trim()) {
      Alert.alert('Error', 'Please enter a field name');
      return;
    }

    const newValue = newFieldType === 'array' ? [] : 
                     newFieldType === 'object' ? {} : '';

    setLocalData(prev => ({
      ...prev,
      [newFieldName]: newValue
    }));
    setNewFieldName('');
  };

  const handleAddArrayItem = (key: string) => {
    setLocalData(prev => ({
      ...prev,
      [key]: [...(prev[key] || []), '']
    }));
  };

  const handleUpdateArrayItem = (key: string, index: number, value: string) => {
    setLocalData(prev => ({
      ...prev,
      [key]: prev[key].map((item: string, i: number) => i === index ? value : item)
    }));
  };

  const handleRemoveArrayItem = (key: string, index: number) => {
    setLocalData(prev => ({
      ...prev,
      [key]: prev[key].filter((_: any, i: number) => i !== index)
    }));
  };

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
        {/* Status */}
        <View style={styles.section}>
          <Text style={styles.label}>Status</Text>
          <TextInput
            style={styles.input}
            value={localData.status}
            onChangeText={(text) => setLocalData(prev => ({ ...prev, status: text }))}
            placeholder="What are you up to?"
            multiline
          />
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.input}
            value={localData.location}
            onChangeText={(text) => setLocalData(prev => ({ ...prev, location: text }))}
            placeholder="Where are you?"
          />
        </View>

        {/* Playlist */}
        <View style={styles.section}>
          <Text style={styles.label}>Current Playlist</Text>
          <TextInput
            style={styles.input}
            value={localData.playlist?.name}
            onChangeText={(text) => setLocalData(prev => ({
              ...prev,
              playlist: { ...prev.playlist, name: text }
            }))}
            placeholder="Playlist name"
          />
          <TextInput
            style={styles.input}
            value={localData.playlist?.uri}
            onChangeText={(text) => setLocalData(prev => ({
              ...prev,
              playlist: { ...prev.playlist, uri: text }
            }))}
            placeholder="Spotify URI"
          />
        </View>

        {/* Activities */}
        <View style={styles.section}>
          <Text style={styles.label}>Activities</Text>
          {localData.activities?.map((activity, index) => (
            <View key={index} style={styles.arrayItem}>
              <TextInput
                style={styles.arrayInput}
                value={activity}
                onChangeText={(text) => handleUpdateArrayItem('activities', index, text)}
                placeholder="Activity"
              />
              <TouchableOpacity
                onPress={() => handleRemoveArrayItem('activities', index)}
                style={styles.removeButton}>
                <Ionicons name="remove-circle-outline" size={24} color="#dc3545" />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => handleAddArrayItem('activities')}>
            <Text style={styles.addButtonText}>Add Activity</Text>
          </TouchableOpacity>
        </View>

        {/* Plans */}
        <View style={styles.section}>
          <Text style={styles.label}>Plans</Text>
          {localData.plans?.map((plan, index) => (
            <View key={index} style={styles.arrayItem}>
              <TextInput
                style={styles.arrayInput}
                value={plan}
                onChangeText={(text) => handleUpdateArrayItem('plans', index, text)}
                placeholder="Plan"
              />
              <TouchableOpacity
                onPress={() => handleRemoveArrayItem('plans', index)}
                style={styles.removeButton}>
                <Ionicons name="remove-circle-outline" size={24} color="#dc3545" />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => handleAddArrayItem('plans')}>
            <Text style={styles.addButtonText}>Add Plan</Text>
          </TouchableOpacity>
        </View>

        {/* Projects */}
        <View style={styles.section}>
          <Text style={styles.label}>Projects</Text>
          {localData.projects?.map((project, index) => (
            <View key={index} style={styles.arrayItem}>
              <TextInput
                style={styles.arrayInput}
                value={project}
                onChangeText={(text) => handleUpdateArrayItem('projects', index, text)}
                placeholder="Project"
                multiline
              />
              <TouchableOpacity
                onPress={() => handleRemoveArrayItem('projects', index)}
                style={styles.removeButton}>
                <Ionicons name="remove-circle-outline" size={24} color="#dc3545" />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => handleAddArrayItem('projects')}>
            <Text style={styles.addButtonText}>Add Project</Text>
          </TouchableOpacity>
        </View>

        {/* Add Custom Field */}
        <View style={styles.section}>
          <Text style={styles.label}>Add Custom Field</Text>
          <TextInput
            style={styles.input}
            value={newFieldName}
            onChangeText={setNewFieldName}
            placeholder="Field name"
          />
          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[styles.typeButton, newFieldType === 'string' && styles.typeButtonActive]}
              onPress={() => setNewFieldType('string')}>
              <Text style={[styles.typeButtonText, newFieldType === 'string' && styles.typeButtonTextActive]}>
                Text
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeButton, newFieldType === 'array' && styles.typeButtonActive]}
              onPress={() => setNewFieldType('array')}>
              <Text style={[styles.typeButtonText, newFieldType === 'array' && styles.typeButtonTextActive]}>
                List
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeButton, newFieldType === 'object' && styles.typeButtonActive]}
              onPress={() => setNewFieldType('object')}>
              <Text style={[styles.typeButtonText, newFieldType === 'object' && styles.typeButtonTextActive]}>
                Object
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddField}>
            <Text style={styles.addButtonText}>Add Field</Text>
          </TouchableOpacity>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
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
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1a1a1a',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  arrayItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  arrayInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  removeButton: {
    marginLeft: 8,
    padding: 4,
  },
  addButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#28a745',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  error: {
    color: '#dc3545',
    textAlign: 'center',
    marginTop: 20,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    marginHorizontal: 4,
    borderRadius: 8,
  },
  typeButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  typeButtonText: {
    color: '#4a4a4a',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
});