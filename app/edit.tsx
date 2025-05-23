import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  PanResponder,
} from 'react-native';
import { useRouter, useLocalSearchParams, useNavigation } from 'expo-router';
import { useNowPage } from '../hooks/NowContext';
import { Ionicons } from '@expo/vector-icons';
import { NowPageData } from '../types/now-page';
import * as Location from 'expo-location';
import * as Clipboard from 'expo-clipboard';

interface PlaylistValue {
  name: string;
  uri: string;
}

interface ObjectValue {
  [key: string]: string;
}

const DraggableItem = ({ 
  item, 
  index, 
  onUpdate, 
  onRemove,
  onMoveUp,
  onMoveDown,
  placeholder,
  multiline = false,
  autoFocus = false,
  isFirst,
  isLast,
  isReordering,
}: { 
  item: string;
  index: number;
  onUpdate: (index: number, value: string) => void;
  onRemove: (index: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  placeholder: string;
  multiline?: boolean;
  autoFocus?: boolean;
  isFirst: boolean;
  isLast: boolean;
  isReordering: boolean;
}) => {
  return (
    <View style={styles.arrayItem}>
      {isReordering && (
        <View style={styles.reorderButtons}>
          <TouchableOpacity
            onPress={() => onMoveUp(index)}
            disabled={isFirst}
            style={[styles.reorderButton, isFirst && styles.disabledButton]}
          >
            <Ionicons 
              name="chevron-up" 
              size={20} 
              color={isFirst ? "#ccc" : "#6c757d"} 
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onMoveDown(index)}
            disabled={isLast}
            style={[styles.reorderButton, isLast && styles.disabledButton]}
          >
            <Ionicons 
              name="chevron-down" 
              size={20} 
              color={isLast ? "#ccc" : "#6c757d"} 
            />
          </TouchableOpacity>
        </View>
      )}
      <TextInput
        style={[styles.arrayInput, !isReordering && styles.arrayInputFull]}
        value={item}
        onChangeText={(text) => onUpdate(index, text)}
        placeholder={placeholder}
        multiline={multiline}
        autoFocus={autoFocus}
      />
      <TouchableOpacity
        onPress={() => onRemove(index)}
        style={styles.removeButton}
      >
        <Ionicons
          name="remove-circle-outline"
          size={24}
          color="#dc3545"
        />
      </TouchableOpacity>
    </View>
  );
};

export default function EditScreen() {
  const { data, updateData, refresh } = useNowPage();
  const router = useRouter();
  const navigation = useNavigation();
  const { section, initialValue, isNew, fieldType, closeAfterSave } =
    useLocalSearchParams<{
      section: string;
      initialValue: string;
      isNew?: string;
      fieldType?: string;
      closeAfterSave?: string;
    }>();

  // Add loading states
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Add state to track the index of the newly added item
  const [newItemIndex, setNewItemIndex] = useState<number | null>(null);

  // Add state to track location fetching
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Add state to track reordering
  const [isReordering, setIsReordering] = useState(false);

  // Add state to track the newly added key
  const [newKey, setNewKey] = useState<string | null>(null);

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
          style: 'cancel',
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
              Alert.alert(
                'Error',
                'Failed to delete the field. Please try again.'
              );
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    // Set up the header buttons
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerButton}
        >
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
              <Text style={[styles.headerButtonText, styles.headerSaveText]}>
                Save
              </Text>
            )}
          </TouchableOpacity>
        </View>
      ),
      headerTitle:
        isNew === 'true'
          ? 'New Field'
          : section
          ? section.charAt(0).toUpperCase() + section.slice(1)
          : 'Edit',
    });
  }, [navigation, value, isSaving, isDeleting]);

  useEffect(() => {
    if (newItemIndex !== null) {
      // Clear the newItemIndex after a short delay to allow the input to render
      setTimeout(() => setNewItemIndex(null), 100);
    }
  }, [newItemIndex]);

  const handleSave = async () => {
    // Clean up the value before saving
    let cleanedValue = value;
    if (Array.isArray(value)) {
      // For arrays, filter out empty strings
      cleanedValue = value.filter((item) => item.trim() !== '');
      if (cleanedValue.length === 0) {
        // Don't save if there are no non-empty items
        router.back();
        return;
      }
    } else if (typeof value === 'object' && value !== null) {
      if (value.hasOwnProperty('name') && value.hasOwnProperty('uri')) {
        // Special case for playlist - require name
        if (!value.name.trim()) {
          router.back();
          return;
        }
      }
    } else if (!String(value).trim()) {
      // Don't save empty string values
      router.back();
      return;
    }

    try {
      setIsSaving(true);
      const updatedData = {
        ...data,
        [section]: cleanedValue,
      };
      await updateData(updatedData);
      await refresh();

      if (closeAfterSave === 'true') {
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
      prev.map((item: string, i: number) => (i === index ? newValue : item))
    );
  };

  const handleRemoveArrayItem = (index: number) => {
    setValue((prev: string[]) =>
      prev.filter((_: any, i: number) => i !== index)
    );
  };

  const handleAddArrayItem = () => {
    setValue((prev: string[] | undefined) => {
      const newArray = [...(prev || []), ''];
      // Set the index of the newly added item
      setNewItemIndex(newArray.length - 1);
      return newArray;
    });
  };

  const handleAddObjectKey = () => {
    if (!objectKey.trim()) {
      Alert.alert('Error', 'Please enter a key name');
      return;
    }
    setValue((prev: ObjectValue) => ({
      ...prev,
      [objectKey]: '',
    }));
    setNewKey(objectKey);
    setObjectKey('');
  };

  const getPlaceholder = (fieldName: string) => {
    const formatted = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
    return `What's your current ${formatted}?`;
  };

  const getCurrentLocation = async () => {
    try {
      setIsGettingLocation(true);

      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to get your current location.'
        );
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({});

      // Reverse geocode to get address
      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (address) {
        const locationString = [address.city, address.country]
          .filter(Boolean)
          .join(', ');

        setValue(locationString);
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to get your current location. Please try again.'
      );
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setValue((prev: string[]) => {
      const newArray = [...prev];
      [newArray[index - 1], newArray[index]] = [newArray[index], newArray[index - 1]];
      return newArray;
    });
  };

  const handleMoveDown = (index: number) => {
    setValue((prev: string[]) => {
      if (index === prev.length - 1) return prev;
      const newArray = [...prev];
      [newArray[index], newArray[index + 1]] = [newArray[index + 1], newArray[index]];
      return newArray;
    });
  };

  if (!section) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>No section selected</Text>
      </View>
    );
  }

  const isMarkdownField = ['string', 'array', 'status', 'activities', 'plans', 'projects'].includes(String(fieldType || section));

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
              {items.length > 0 ? (
                items.map((item: string, index: number) => (
                  <DraggableItem
                    key={index}
                    item={item}
                    index={index}
                    onUpdate={handleUpdateArrayItem}
                    onRemove={handleRemoveArrayItem}
                    onMoveUp={handleMoveUp}
                    onMoveDown={handleMoveDown}
                    placeholder="Add an item"
                    autoFocus={newItemIndex === index}
                    isFirst={index === 0}
                    isLast={index === items.length - 1}
                    isReordering={isReordering}
                  />
                ))
              ) : (
                <Text style={styles.emptyText}>
                  No items yet. Add one below!
                </Text>
              )}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={handleAddArrayItem}
                >
                  <Text style={styles.addButtonText}>Add Item</Text>
                </TouchableOpacity>
              </View>
            </>
          );

        case 'object':
          return (
            <>
              {Object.entries(value || {}).map(([key, val]) => (
                <View key={key} style={styles.objectItem}>
                  <Text style={styles.objectKey}>{key}:</Text>
                  <TextInput
                    style={styles.objectValue}
                    value={String(val || '')}
                    onChangeText={(text) =>
                      setValue((prev: ObjectValue) => ({
                        ...prev,
                        [key]: text,
                      }))
                    }
                    placeholder={`Enter value for ${key}`}
                    autoFocus={key === newKey}
                    onFocus={() => {
                      if (key === newKey) {
                        setNewKey(null);
                      }
                    }}
                  />
                </View>
              ))}
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
                  onPress={handleAddObjectKey}
                >
                  <Text style={styles.addButtonText}>Add Key</Text>
                </TouchableOpacity>
              </View>
            </>
          );
      }
    }

    // For existing fields, use the previous logic
    switch (section) {
      case 'status':
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

      case 'location':
        return (
          <View style={styles.locationContainer}>
            <TextInput
              style={[styles.input, styles.locationInput]}
              value={value || ''}
              onChangeText={setValue}
              placeholder={getPlaceholder(section)}
              autoFocus
            />
            <TouchableOpacity
              style={styles.locationButton}
              onPress={getCurrentLocation}
              disabled={isGettingLocation}
            >
              {isGettingLocation ? (
                <ActivityIndicator size="small" color="#007AFF" />
              ) : (
                <Ionicons name="location" size={24} color="#007AFF" />
              )}
            </TouchableOpacity>
          </View>
        );

      case 'playlist':
        return (
          <>
            <TextInput
              style={styles.input}
              value={value?.name || ''}
              onChangeText={(text) =>
                setValue((prev: PlaylistValue) => ({
                  ...prev,
                  name: text,
                }))
              }
              placeholder="What are you listening to?"
              autoFocus
            />
            <View style={styles.playlistUriContainer}>
              <TextInput
                style={[styles.input, styles.uriInput]}
                value={value?.uri || ''}
                onChangeText={(text) =>
                  setValue((prev: PlaylistValue) => ({
                    ...prev,
                    uri: text,
                  }))
                }
                placeholder="Add the Spotify URI (optional)"
              />
              <TouchableOpacity
                style={styles.clipboardButton}
                onPress={async () => {
                  try {
                    const text = await Clipboard.getStringAsync();
                    // Extract playlist ID from various Spotify URL formats
                    const match = text.match(/spotify:playlist:([a-zA-Z0-9]+)|open\.spotify\.com\/playlist\/([a-zA-Z0-9]+)/);
                    if (match) {
                      const playlistId = match[1] || match[2];
                      try {
                        // Use a CORS proxy to fetch the playlist page
                        const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(`https://open.spotify.com/playlist/${playlistId}`)}`);
                        const html = await response.text();
                        
                        // Extract the playlist name from the embed data
                        const nameMatch = html.match(/"name":"(.*?)"/);
                        if (nameMatch) {
                          const playlistName = nameMatch[1].trim();
                          setValue((prev: PlaylistValue) => ({
                            ...prev,
                            name: playlistName,
                            uri: playlistId,
                          }));
                        } else {
                          // If we can't find the name, just set the URI
                          setValue((prev: PlaylistValue) => ({
                            ...prev,
                            uri: playlistId,
                          }));
                        }
                      } catch (error) {
                        // If fetching fails, just set the URI
                        setValue((prev: PlaylistValue) => ({
                          ...prev,
                          uri: playlistId,
                        }));
                      }
                    } else {
                      Alert.alert('Error', 'No valid Spotify playlist URL found in clipboard');
                    }
                  } catch (error) {
                    Alert.alert('Error', 'Failed to read from clipboard');
                  }
                }}
              >
                <Ionicons name="clipboard-outline" size={24} color="#007AFF" />
              </TouchableOpacity>
            </View>
          </>
        );

      case 'activities':
      case 'plans':
      case 'projects':
        const items = value || [];
        return (
          <>
            {items.length > 0 ? (
              items.map((item: string, index: number) => (
                <DraggableItem
                  key={index}
                  item={item}
                  index={index}
                  onUpdate={handleUpdateArrayItem}
                  onRemove={handleRemoveArrayItem}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                  placeholder={`Add a ${section.slice(0, -1)}`}
                  multiline={section === 'projects'}
                  autoFocus={newItemIndex === index}
                  isFirst={index === 0}
                  isLast={index === items.length - 1}
                  isReordering={isReordering}
                />
              ))
            ) : (
              <Text style={styles.emptyText}>
                No {section} yet. Add one below!
              </Text>
            )}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddArrayItem}
              >
                <Text style={styles.addButtonText}>Add Item</Text>
              </TouchableOpacity>
              {items.length > 1 && (
                <TouchableOpacity
                  style={[styles.addButton]}
                  onPress={() => setIsReordering(!isReordering)}
                >
                  <Text style={styles.addButtonText}>
                    {isReordering ? 'Done Reordering' : 'Reorder Items'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        );

      default:
        if (Array.isArray(value)) {
          const items = value || [];
          return (
            <>
              {items.length > 0 ? (
                items.map((item: string, index: number) => (
                  <DraggableItem
                    key={index}
                    item={item}
                    index={index}
                    onUpdate={handleUpdateArrayItem}
                    onRemove={handleRemoveArrayItem}
                    onMoveUp={handleMoveUp}
                    onMoveDown={handleMoveDown}
                    placeholder={`Add an item`}
                    autoFocus={newItemIndex === index}
                    isFirst={index === 0}
                    isLast={index === items.length - 1}
                    isReordering={isReordering}
                  />
                ))
              ) : (
                <Text style={styles.emptyText}>
                  No items yet. Add one below!
                </Text>
              )}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={handleAddArrayItem}
                >
                  <Text style={styles.addButtonText}>Add Item</Text>
                </TouchableOpacity>
                {items.length > 1 && (
                  <TouchableOpacity
                    style={[styles.addButton]}
                    onPress={() => setIsReordering(!isReordering)}
                  >
                    <Text style={styles.addButtonText}>
                      {isReordering ? 'Done Reordering' : 'Change Order'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          );
        } else if (typeof value === 'object' && value !== null) {
          return (
            <>
              {Object.entries(value).map(([key, val]) => (
                <View key={key} style={styles.objectItem}>
                  <Text style={styles.objectKey}>{key}:</Text>
                  <TextInput
                    style={styles.objectValue}
                    value={String(val || '')}
                    onChangeText={(text) =>
                      setValue((prev: ObjectValue) => ({
                        ...prev,
                        [key]: text,
                      }))
                    }
                    placeholder={`Enter value for ${key}`}
                    autoFocus={key === newKey}
                    onFocus={() => {
                      if (key === newKey) {
                        setNewKey(null);
                      }
                    }}
                  />
                </View>
              ))}
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
                  onPress={handleAddObjectKey}
                >
                  <Text style={styles.addButtonText}>Add Key</Text>
                </TouchableOpacity>
              </View>
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
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <View style={styles.section}>{renderField()}</View>
          {isMarkdownField && (
            <Text style={styles.hint}>Markdown formatting supported.</Text>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    flexGrow: 1,
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
  hint: {
    textAlign: 'center',
  },
  arrayItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
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
    flex: 1,
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
    paddingTop: 12,
    paddingBottom: 0,
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
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationInput: {
    flex: 1,
    marginBottom: 0,
  },
  locationButton: {
    marginLeft: 8,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  dragHandle: {
    padding: 8,
    marginRight: 8,
    minWidth: 40,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  draggingItem: {
    opacity: 0.8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  reorderButtons: {
    flexDirection: 'column',
    marginRight: 8,
    justifyContent: 'center',
  },
  reorderButton: {
    padding: 4,
    borderRadius: 4,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: 8,
  },
  arrayInputFull: {
    marginLeft: 0,
  },
  playlistUriContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  uriInput: {
    flex: 1,
    marginBottom: 0,
  },
  clipboardButton: {
    marginLeft: 8,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
});
