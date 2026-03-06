import { View, Text, StyleSheet, TouchableOpacity, TextInput, TouchableWithoutFeedback, Keyboard, Platform, useColorScheme } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { useRouter, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

type FieldType = 'string' | 'array' | 'object';

interface FieldTypeOption {
  type: FieldType;
  icon: string;
  label: string;
  description: string;
}

const fieldTypes: FieldTypeOption[] = [
  {
    type: 'string',
    icon: 'text-outline',
    label: 'Text',
    description: 'Single line of text'
  },
  {
    type: 'array',
    icon: 'list-outline',
    label: 'List',
    description: 'Multiple items in a list'
  },
  {
    type: 'object',
    icon: 'grid-outline',
    label: 'Object',
    description: 'Key-value pairs'
  }
];

export default function NewFieldScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const router = useRouter();
  const navigation = useNavigation();
  const [selectedType, setSelectedType] = useState<FieldType>('string');
  const [fieldName, setFieldName] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginLeft: 16 }}
        >
          <Text style={{ color: theme.tint, fontSize: 17 }}>
            Cancel
          </Text>
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity
          onPress={handleContinue}
          style={{ marginRight: 16 }}
        >
          <Text style={{ color: theme.tint, fontSize: 17, fontWeight: '600' }}>
            Create
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, fieldName, selectedType, theme]);

  const handleContinue = () => {
    if (!fieldName.trim()) {
      setError('Please enter a field name');
      return;
    }

    const initialValue = selectedType === 'array' ? '[]' : 
                        selectedType === 'object' ? '{}' : '';

    router.replace({
      pathname: '/edit',
      params: {
        section: fieldName.toLowerCase(),
        initialValue,
        isNew: 'true',
        fieldType: selectedType,
        closeAfterSave: 'true'
      }
    });
  };

  return (
    <TouchableWithoutFeedback onPress={() => {
      if (Platform.OS !== 'web') {
        Keyboard.dismiss();
        inputRef.current?.blur();
      }
    }}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.title, { color: theme.text }]}>Add New Field</Text>
        
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: theme.text }]}>Field Name</Text>
          <TextInput
            ref={inputRef}
            style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.text }]}
            value={fieldName}
            onChangeText={(text) => {
              setFieldName(text);
              setError('');
            }}
            placeholder="Enter field name"
            placeholderTextColor={theme.secondaryText}
            autoCapitalize="none"
          />
        </View>

        <Text style={[styles.label, { color: theme.text }]}>Field Type</Text>
        <View style={styles.typeContainer}>
          {fieldTypes.map((type) => (
            <TouchableOpacity
              key={type.type}
              style={[
                styles.typeOption,
                { backgroundColor: theme.cardBackground, borderColor: theme.border },
                selectedType === type.type && [styles.selectedType, { backgroundColor: theme.tint, borderColor: theme.tint }]
              ]}
              onPress={() => {
                setSelectedType(type.type);
                setError('');
              }}
            >
              <Ionicons
                name={type.icon as any}
                size={24}
                color={selectedType === type.type ? '#fff' : theme.tint}
              />
              <Text style={[
                styles.typeLabel,
                { color: theme.text },
                selectedType === type.type && styles.selectedTypeText
              ]}>
                {type.label}
              </Text>
              <Text style={[
                styles.typeDescription,
                { color: theme.secondaryText },
                selectedType === type.type && styles.selectedTypeText
              ]}>
                {type.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity
          style={[styles.continueButton, { backgroundColor: theme.tint }, !fieldName.trim() && [styles.continueButtonDisabled, { backgroundColor: theme.border }]]}
          onPress={handleContinue}
          disabled={!fieldName.trim()}
        >
          <Text style={[styles.continueButtonText, !fieldName.trim() && styles.continueButtonTextDisabled]}>
            Continue
          </Text>
        </TouchableOpacity>
        {error ? <Text style={[styles.error, { color: theme.error }]}>{error}</Text> : null}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  typeContainer: {
    gap: 12,
  },
  typeOption: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  selectedType: {
  },
  typeLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  typeDescription: {
    fontSize: 14,
    marginLeft: 'auto',
  },
  selectedTypeText: {
    color: '#fff',
  },
  error: {
    marginTop: 16,
  },
  continueButton: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  continueButtonDisabled: {
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  continueButtonTextDisabled: {
    color: '#fff8',
  },
}); 