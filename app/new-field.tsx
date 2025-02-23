import { View, Text, StyleSheet, TouchableOpacity, TextInput, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useState, useRef } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

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
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<FieldType>('string');
  const [fieldName, setFieldName] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<TextInput>(null);

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
      Keyboard.dismiss();
      inputRef.current?.blur();
    }}>
      <View style={styles.container}>
        <Text style={styles.title}>Add New Field</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Field Name</Text>
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={fieldName}
            onChangeText={(text) => {
              setFieldName(text);
              setError('');
            }}
            placeholder="Enter field name"
            placeholderTextColor="#999"
          />
        </View>

        <Text style={styles.label}>Field Type</Text>
        <View style={styles.typeContainer}>
          {fieldTypes.map((type) => (
            <TouchableOpacity
              key={type.type}
              style={[
                styles.typeOption,
                selectedType === type.type && styles.selectedType
              ]}
              onPress={() => {
                setSelectedType(type.type);
                setError('');
              }}
            >
              <Ionicons
                name={type.icon as any}
                size={24}
                color={selectedType === type.type ? '#fff' : '#007AFF'}
              />
              <Text style={[
                styles.typeLabel,
                selectedType === type.type && styles.selectedTypeText
              ]}>
                {type.label}
              </Text>
              <Text style={[
                styles.typeDescription,
                selectedType === type.type && styles.selectedTypeText
              ]}>
                {type.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity
          style={[styles.continueButton, !fieldName.trim() && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={!fieldName.trim()}
        >
          <Text style={[styles.continueButtonText, !fieldName.trim() && styles.continueButtonTextDisabled]}>
            Continue
          </Text>
        </TouchableOpacity>
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 24,
    color: '#1a1a1a',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#1a1a1a',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  typeContainer: {
    gap: 12,
  },
  typeOption: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  selectedType: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  typeLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
    color: '#1a1a1a',
  },
  typeDescription: {
    fontSize: 14,
    color: '#666',
    marginLeft: 'auto',
  },
  selectedTypeText: {
    color: '#fff',
  },
  error: {
    color: '#dc3545',
    marginTop: 16,
  },
  continueButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  continueButtonDisabled: {
    backgroundColor: '#ccc',
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