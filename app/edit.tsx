import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams, useNavigation } from 'expo-router';
import { useNowPage } from '../hooks/useNowPage';
import { Ionicons } from '@expo/vector-icons';
import { NowPageData } from '../types/now-page';

export default function EditScreen() {
  const { data, loading, error, updateData } = useNowPage();
  const [localData, setLocalData] = useState<NowPageData>({});
  const router = useRouter();
  const navigation = useNavigation();
  const { section } = useLocalSearchParams<{ section: string }>();

  useEffect(() => {
    if (data) {
      setLocalData(data);
    }
  }, [data]);

  useEffect(() => {
    // Set up the header buttons
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>Cancel</Text>
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
          <Text style={[styles.headerButtonText, styles.headerSaveText]}>Save</Text>
        </TouchableOpacity>
      ),
      headerTitle: section ? section.charAt(0).toUpperCase() + section.slice(1) : 'Edit',
    });
  }, [navigation, localData]);

  const handleSave = async () => {
    try {
      await updateData(localData);
      router.back();
    } catch (err) {
      Alert.alert('Error', 'Failed to update your now page. Please try again.');
    }
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

  const handleAddArrayItem = (key: string) => {
    setLocalData(prev => ({
      ...prev,
      [key]: [...(prev[key] || []), '']
    }));
  };

  const getPlaceholder = (fieldName: string) => {
    const formatted = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
    return `What's your current ${formatted}?`;
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

  if (!section) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>No section selected</Text>
      </View>
    );
  }

  const renderField = () => {
    switch (section) {
      case 'status':
      case 'location':
        return (
          <TextInput
            style={styles.input}
            value={localData[section] || ''}
            onChangeText={(text) => setLocalData(prev => ({ ...prev, [section]: text }))}
            placeholder={getPlaceholder(section)}
            multiline={section === 'status'}
            autoFocus
          />
        );
      
      case 'playlist':
        return (
          <>
            <TextInput
              style={styles.input}
              value={localData.playlist?.name || ''}
              onChangeText={(text) => setLocalData(prev => ({
                ...prev,
                playlist: { ...prev.playlist, name: text }
              }))}
              placeholder="What are you listening to?"
              autoFocus
            />
            <TextInput
              style={styles.input}
              value={localData.playlist?.uri || ''}
              onChangeText={(text) => setLocalData(prev => ({
                ...prev,
                playlist: { ...prev.playlist, uri: text }
              }))}
              placeholder="Add the Spotify URI (optional)"
            />
          </>
        );
      
      case 'activities':
      case 'plans':
      case 'projects':
        const items = localData[section] || [];
        return (
          <>
            {items.length > 0 ? items.map((item: string, index: number) => (
              <View key={index} style={styles.arrayItem}>
                <TextInput
                  style={styles.arrayInput}
                  value={item}
                  onChangeText={(text) => handleUpdateArrayItem(section, index, text)}
                  placeholder={`Add a ${section.slice(0, -1)}`}
                  multiline={section === 'projects'}
                  autoFocus={index === 0}
                />
                <TouchableOpacity
                  onPress={() => handleRemoveArrayItem(section, index)}
                  style={styles.removeButton}>
                  <Ionicons name="remove-circle-outline" size={24} color="#dc3545" />
                </TouchableOpacity>
              </View>
            )) : (
              <Text style={styles.emptyText}>No {section} yet. Add one below!</Text>
            )}
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => handleAddArrayItem(section)}>
              <Text style={styles.addButtonText}>Add {section.slice(0, -1)}</Text>
            </TouchableOpacity>
          </>
        );
      
      default:
        if (Array.isArray(localData[section])) {
          const items = localData[section] || [];
          return (
            <>
              {items.length > 0 ? items.map((item: string, index: number) => (
                <View key={index} style={styles.arrayItem}>
                  <TextInput
                    style={styles.arrayInput}
                    value={item}
                    onChangeText={(text) => handleUpdateArrayItem(section, index, text)}
                    placeholder={`Add an item`}
                    autoFocus={index === 0}
                  />
                  <TouchableOpacity
                    onPress={() => handleRemoveArrayItem(section, index)}
                    style={styles.removeButton}>
                    <Ionicons name="remove-circle-outline" size={24} color="#dc3545" />
                  </TouchableOpacity>
                </View>
              )) : (
                <Text style={styles.emptyText}>No items yet. Add one below!</Text>
              )}
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => handleAddArrayItem(section)}>
                <Text style={styles.addButtonText}>Add Item</Text>
              </TouchableOpacity>
            </>
          );
        } else if (typeof localData[section] === 'object' && localData[section] !== null) {
          return Object.entries(localData[section]).map(([key, value]) => (
            <TextInput
              key={key}
              style={styles.input}
              value={String(value || '')}
              onChangeText={(text) => setLocalData(prev => ({
                ...prev,
                [section]: { ...prev[section], [key]: text }
              }))}
              placeholder={`Enter ${key}`}
              autoFocus
            />
          ));
        } else {
          return (
            <TextInput
              style={styles.input}
              value={String(localData[section] || '')}
              onChangeText={(text) => setLocalData(prev => ({ ...prev, [section]: text }))}
              placeholder={getPlaceholder(section)}
              autoFocus
            />
          );
        }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.section}>
          {renderField()}
        </View>
      </View>
    </View>
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
  error: {
    color: '#dc3545',
    textAlign: 'center',
    marginTop: 20,
  },
  headerButton: {
    marginHorizontal: 16,
  },
  headerButtonText: {
    color: '#007AFF',
    fontSize: 17,
    fontWeight: '400',
  },
  headerSaveText: {
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6c757d',
    marginBottom: 16,
    fontSize: 16,
  },
}); 