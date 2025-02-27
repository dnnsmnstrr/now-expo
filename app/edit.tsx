import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams, useNavigation } from 'expo-router';
import { useNowPage } from '../hooks/NowContext';
import { Ionicons } from '@expo/vector-icons';
import { NowPageData } from '../types/now-page';

interface PlaylistValue {
  name: string;
  uri: string;
}

interface ObjectValue {
  [key: string]: string;
}

export default function EditScreen() {
  const { data, updateData, refresh } = useNowPage();
  const router = useRouter();
  const navigation = useNavigation();
  const { section, initialValue, isNew, fieldType, closeAfterSave } = useLocalSearchParams<{ 
    section: string; 
    initialValue: string;
    isNew?: string;
    fieldType?: string;
    closeAfterSave?: string;
  }>();
  
  // Add loading states
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Parse the initial value based on the section type
  const parseInitialValue = () => {
    if (!initialValue) return '';
    try {
      const parsed = JSON.parse(initialValue);
      return parsed;
    } catch {
      return initialValue;
    }
  };

  const [value, setValue] = useState<any>(parseInitialValue());
  const [objectKey, setObjectKey] = useState('');

  const handleDelete = async () => {
    Alert.alert(
      'Delete Field',
      'Are you sure you want to delete this field? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsDeleting(true);
              // Create a new object without the deleted field
              const { [section]: deletedField, ...remainingData } = data || {};
              await updateData(remainingData as NowPageData);
              await refresh(); // Refresh the now page data
              router.back();
            } catch (err) {
              Alert.alert('Error', 'Failed to delete the field. Please try again.');
            } finally {
              setIsDeleting(false);
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    // Set up the header buttons
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>Cancel</Text>
        </TouchableOpacity>
      ),
      headerRight: () => (
        <View style={styles.headerButtons}>
          {isNew !== 'true' && (
            <TouchableOpacity 
              onPress={handleDelete} 
              style={[styles.headerButton, styles.deleteButton]}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="#dc3545" />
              ) : (
                <Ionicons name="trash-outline" size={24} color="#dc3545" />
              )}
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            onPress={handleSave} 
            style={styles.headerButton}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#007AFF" />
            ) : (
              <Text style={[styles.headerButtonText, styles.headerSaveText]}>Save</Text>
            )}
          </TouchableOpacity>
        </View>
      ),
      headerTitle: isNew === 'true' ? 'New Field' : section ? section.charAt(0).toUpperCase() + section.slice(1) : 'Edit',
    });
  }, [navigation, value, isSaving, isDeleting]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      // Create a new object with all existing data plus the updated field
      const updatedData = {
        ...data,
        [section]: value
      };
      await updateData(updatedData);
      await refresh(); // Refresh the now page data
      
      if (closeAfterSave === 'true') {
        // Replace entire stack with the root tab
        router.replace('/(tabs)');
      } else {
        router.back();
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to update your now page. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateArrayItem = (index: number, newValue: string) => {
    setValue((prev: string[]) => 
      prev.map((item: string, i: number) => i === index ? newValue : item)
    );
  };

  const handleRemoveArrayItem = (index: number) => {
    setValue((prev: string[]) => 
      prev.filter((_: any, i: number) => i !== index)
    );
  };

  const handleAddArrayItem = () => {
    setValue((prev: string[] | undefined) => [...(prev || []), '']);
  };

  const handleAddObjectKey = () => {
    if (!objectKey.trim()) {
      Alert.alert('Error', 'Please enter a key name');
      return;
    }
    setValue((prev: ObjectValue) => ({
      ...prev,
      [objectKey]: ''
    }));
    setObjectKey('');
  };

  const getPlaceholder = (fieldName: string) => {
    const formatted = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
    return `What's your current ${formatted}?`;
  };

  if (!section) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>No section selected</Text>
      </View>
    );
  }

  const renderField = () => {
    // For new fields, use the fieldType parameter
    if (isNew === 'true' && fieldType) {
      switch (fieldType) {
        case 'string':
          return (
            <TextInput
              style={styles.input}
              value={value || ''}
              onChangeText={setValue}
              placeholder={getPlaceholder(section)}
              autoFocus
            />
          );
        
        case 'array':
          const items = value || [];
          return (
            <>
              {items.length > 0 ? items.map((item: string, index: number) => (
                <View key={index} style={styles.arrayItem}>
                  <TextInput
                    style={styles.arrayInput}
                    value={item}
                    onChangeText={(text) => handleUpdateArrayItem(index, text)}
                    placeholder="Add an item"
                    autoFocus={index === 0}
                  />
                  <TouchableOpacity
                    onPress={() => handleRemoveArrayItem(index)}
                    style={styles.removeButton}>
                    <Ionicons name="remove-circle-outline" size={24} color="#dc3545" />
                  </TouchableOpacity>
                </View>
              )) : (
                <Text style={styles.emptyText}>No items yet. Add one below!</Text>
              )}
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddArrayItem}>
                <Text style={styles.addButtonText}>Add Item</Text>
              </TouchableOpacity>
            </>
          );
        
        case 'object':
          return (
            <>
              <View style={styles.objectKeyInput}>
                <TextInput
                  style={[styles.input, styles.keyInput]}
                  value={objectKey}
                  onChangeText={setObjectKey}
                  placeholder="Enter key name"
                  autoFocus
                />
                <TouchableOpacity
                  style={[styles.addButton, styles.addKeyButton]}
                  onPress={handleAddObjectKey}>
                  <Text style={styles.addButtonText}>Add Key</Text>
                </TouchableOpacity>
              </View>
              {Object.entries(value || {}).map(([key, val]) => (
                <View key={key} style={styles.objectItem}>
                  <Text style={styles.objectKey}>{key}:</Text>
                  <TextInput
                    style={styles.objectValue}
                    value={String(val || '')}
                    onChangeText={(text) => setValue((prev: ObjectValue) => ({
                      ...prev,
                      [key]: text
                    }))}
                    placeholder={`Enter value for ${key}`}
                  />
                </View>
              ))}
            </>
          );
      }
    }

    // For existing fields, use the previous logic
    switch (section) {
      case 'status':
      case 'location':
        return (
          <TextInput
            style={styles.input}
            value={value || ''}
            onChangeText={setValue}
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
              value={value?.name || ''}
              onChangeText={(text) => setValue((prev: PlaylistValue) => ({
                ...prev,
                name: text
              }))}
              placeholder="What are you listening to?"
              autoFocus
            />
            <TextInput
              style={styles.input}
              value={value?.uri || ''}
              onChangeText={(text) => setValue((prev: PlaylistValue) => ({
                ...prev,
                uri: text
              }))}
              placeholder="Add the Spotify URI (optional)"
            />
          </>
        );
      
      case 'activities':
      case 'plans':
      case 'projects':
        const items = value || [];
        return (
          <>
            {items.length > 0 ? items.map((item: string, index: number) => (
              <View key={index} style={styles.arrayItem}>
                <TextInput
                  style={styles.arrayInput}
                  value={item}
                  onChangeText={(text) => handleUpdateArrayItem(index, text)}
                  placeholder={`Add a ${section.slice(0, -1)}`}
                  multiline={section === 'projects'}
                  autoFocus={index === 0}
                />
                <TouchableOpacity
                  onPress={() => handleRemoveArrayItem(index)}
                  style={styles.removeButton}>
                  <Ionicons name="remove-circle-outline" size={24} color="#dc3545" />
                </TouchableOpacity>
              </View>
            )) : (
              <Text style={styles.emptyText}>No {section} yet. Add one below!</Text>
            )}
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddArrayItem}>
              <Text style={styles.addButtonText}>Add Item</Text>
            </TouchableOpacity>
          </>
        );
      
      default:
        if (Array.isArray(value)) {
          const items = value || [];
          return (
            <>
              {items.length > 0 ? items.map((item: string, index: number) => (
                <View key={index} style={styles.arrayItem}>
                  <TextInput
                    style={styles.arrayInput}
                    value={item}
                    onChangeText={(text) => handleUpdateArrayItem(index, text)}
                    placeholder={`Add an item`}
                    autoFocus={index === 0}
                  />
                  <TouchableOpacity
                    onPress={() => handleRemoveArrayItem(index)}
                    style={styles.removeButton}>
                    <Ionicons name="remove-circle-outline" size={24} color="#dc3545" />
                  </TouchableOpacity>
                </View>
              )) : (
                <Text style={styles.emptyText}>No items yet. Add one below!</Text>
              )}
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddArrayItem}>
                <Text style={styles.addButtonText}>Add Item</Text>
              </TouchableOpacity>
            </>
          );
        } else if (typeof value === 'object' && value !== null) {
          return (
            <>
              <View style={styles.objectKeyInput}>
                <TextInput
                  style={[styles.input, styles.keyInput]}
                  value={objectKey}
                  onChangeText={setObjectKey}
                  placeholder="Enter key name"
                />
                <TouchableOpacity
                  style={[styles.addButton, styles.addKeyButton]}
                  onPress={handleAddObjectKey}>
                  <Text style={styles.addButtonText}>Add Key</Text>
                </TouchableOpacity>
              </View>
              {Object.entries(value).map(([key, val]) => (
                <View key={key} style={styles.objectItem}>
                  <Text style={styles.objectKey}>{key}:</Text>
                  <TextInput
                    style={styles.objectValue}
                    value={String(val || '')}
                    onChangeText={(text) => setValue((prev: ObjectValue) => ({
                      ...prev,
                      [key]: text
                    }))}
                    placeholder={`Enter value for ${key}`}
                  />
                </View>
              ))}
            </>
          );
        } else {
          return (
            <TextInput
              style={styles.input}
              value={String(value || '')}
              onChangeText={setValue}
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
  objectKeyInput: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  keyInput: {
    flex: 1,
    marginBottom: 0,
    marginRight: 8,
  },
  addKeyButton: {
    marginTop: 0,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  objectItem: {
    marginBottom: 12,
  },
  objectKey: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6c757d',
    marginBottom: 4,
  },
  objectValue: {
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    marginRight: 8,
  },
}); 