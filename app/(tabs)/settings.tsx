import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Linking, TextInput, ActivityIndicator, Modal, ScrollView } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useNowPage } from '../../hooks/NowContext';
import { useGistContext } from '../../hooks/GistContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface GistMenuProps {
  gistId: string;
  isVisible: boolean;
  onClose: () => void;
  onClone: () => void;
  onRename: () => void;
  onDelete: () => void;
  onOpenInBrowser: () => void;
}

function GistMenu({ gistId, isVisible, onClose, onClone, onRename, onDelete, onOpenInBrowser }: GistMenuProps) {
  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <View style={styles.menuContainer}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              onOpenInBrowser();
              onClose();
            }}
          >
            <Ionicons name="open-outline" size={24} color="#007AFF" />
            <Text style={styles.menuText}>Open in Browser</Text>
          </TouchableOpacity>
          <View style={styles.menuSeparator} />
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              onClone();
              onClose();
            }}
          >
            <Ionicons name="copy-outline" size={24} color="#007AFF" />
            <Text style={styles.menuText}>Clone Gist</Text>
          </TouchableOpacity>
          <View style={styles.menuSeparator} />
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              onRename();
              onClose();
            }}
          >
            <Ionicons name="pencil-outline" size={24} color="#007AFF" />
            <Text style={styles.menuText}>Rename Gist</Text>
          </TouchableOpacity>
          <View style={styles.menuSeparator} />
          <TouchableOpacity 
            style={[styles.menuItem, styles.deleteMenuItem]}
            onPress={() => {
              onDelete();
              onClose();
            }}
          >
            <Ionicons name="trash-outline" size={24} color="#dc3545" />
            <Text style={styles.deleteMenuText}>Delete Gist</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

interface RenameModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (newName: string) => void;
  currentName: string;
  gistId: string;
}

function RenameModal({ isVisible, onClose, onSubmit, currentName, gistId }: RenameModalProps) {
  console.log(currentName)
  const [newName, setNewName] = useState(currentName);

  useEffect(() => {
    setNewName(currentName)
  }, [currentName])
  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <View style={[styles.menuContainer, styles.renameContainer]}>
          <Text style={styles.renameTitle}>Rename Gist</Text>
          <TextInput
            style={styles.renameInput}
            value={newName}
            onChangeText={setNewName}
            placeholder="Enter new name"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <View style={styles.renameButtons}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={() => {
                onSubmit(newName);
                onClose();
              }}
            >
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

export default function SettingsScreen() {
  const { isAuthenticated, login, logout, user, token } = useAuth();
  const { currentGistId, gists, loading, error, fetchGists, createGist, selectGist, cloneGist, deleteGist, renameGist } = useGistContext();
  const [authToken, setAuthToken] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [menuGistId, setMenuGistId] = useState<string | null>(null);
  const [renamingGistId, setRenamingGistId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchGists(token);
    }
  }, [isAuthenticated, token]);

  const handleLogin = async () => {
    try {
      await login(authToken);
      setAuthToken('');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to login. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  const handleCreateGist = async () => {
    try {
      if (!token) return;
      await createGist(token);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Error', 'Failed to create gist. Please try again.');
    }
  };

  const handleSelectGist = async (gistId: string) => {
    try {
      await selectGist(gistId);
      // router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Error', 'Failed to select gist. Please try again.');
    }
  };

  const handleCloneGist = async (gistId: string) => {
    try {
      if (!token) return;
      await cloneGist(token, gistId);
      // Alert.alert('Success', 'Gist cloned successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to clone gist. Please try again.');
    }
  };

  const handleDeleteGist = async (gistId: string) => {
    Alert.alert(
      'Delete Gist',
      'Are you sure you want to delete this gist? This action cannot be undone.',
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
              if (!token) return;
              await deleteGist(token, gistId);
              Alert.alert('Success', 'Gist deleted successfully!');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete gist. Please try again.');
            }
          },
        },
      ],
    );
  };

  const handleRenameGist = async (gistId: string, newName: string) => {
    try {
      if (!token) return;
      await renameGist(token, gistId, newName);
      // Alert.alert('Success', 'Gist renamed successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to rename gist. Please try again.');
    }
  };

  const handleOpenInBrowser = async (gistId: string) => {
    const gist = gists.find(g => g.id === gistId);
    if (gist?.html_url) {
      await Linking.openURL(gist.html_url);
    }
  };

  const showMenu = (gistId: string) => {
    const gist = gists.find(g => g.id === gistId);
    setMenuGistId(gistId);
    setMenuVisible(true);
  };

  const showRenameModal = (gistId: string) => {
    setRenamingGistId(gistId);
    setRenameModalVisible(true);
  };

  const renderGistSelection = () => {
    if (loading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.section}>
          <Text style={styles.error}>{error}</Text>
          <TouchableOpacity
            style={[styles.button, styles.retryButton]}
            onPress={() => token && fetchGists(token)}>
            <Text style={styles.buttonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (gists.length === 0) {
      return (
        <View style={styles.section}>
          <Text style={styles.description}>
            No now.json gist found. Create one to get started with your now page.
          </Text>
          <TouchableOpacity
            style={[styles.button, styles.createButton]}
            onPress={handleCreateGist}>
            <Text style={styles.buttonText}>Create Now Page Gist</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Now Page Gist</Text>
        {gists.map(gist => (
          <TouchableOpacity
            key={gist.id}
            style={[
              styles.gistItem,
              currentGistId === gist.id && styles.selectedGist,
            ]}
            onPress={() => handleSelectGist(gist.id)}>
            <Ionicons
              name={currentGistId === gist.id ? 'radio-button-on' : 'radio-button-off'}
              size={24}
              color="#007AFF"
            />
            <View style={styles.gistInfo}>
              <Text style={styles.gistDescription}>
                {gist.description || 'No description'}
              </Text>
              <Text style={styles.gistId}>ID: {gist.id}</Text>
            </View>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={(e) => {
                e.stopPropagation();
                showMenu(gist.id);
              }}
            >
              <Ionicons name="ellipsis-vertical" size={24} color="#6c757d" />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[styles.button, styles.createButton]}
          onPress={handleCreateGist}>
          <Text style={styles.buttonText}>Create Another Gist</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>GitHub Account</Text>
        {isAuthenticated ? (
          <>
            <Text style={styles.userInfo}>Logged in as: {user?.login}</Text>
            <TouchableOpacity
              style={[styles.button, styles.logoutButton]}
              onPress={handleLogout}>
              <Text style={styles.buttonText}>Logout</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View>
            <Text style={styles.description}>
              Enter your GitHub personal access token to manage your now page.
              The token needs 'gist' scope to read and write your now page data.
            </Text>
            <TouchableOpacity
              onPress={() => Linking.openURL('https://github.com/settings/tokens/new')}
              style={styles.link}>
              <Text style={styles.linkText}>Create a new token</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              value={authToken}
              onChangeText={setAuthToken}
              placeholder="Enter GitHub token"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={[styles.button, styles.loginButton]}
              onPress={handleLogin}>
              <Text style={styles.buttonText}>Login with Token</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {isAuthenticated && renderGistSelection()}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.description}>
          This app helps you maintain a "now page" - a place to share what you're currently focused on,
          your recent activities, and upcoming plans. The data is stored in a GitHub Gist, making it
          easy to integrate with other platforms.
        </Text>
        <TouchableOpacity
          onPress={() => Linking.openURL('https://nownownow.com/about')}
          style={styles.link}>
          <Text style={styles.linkText}>Learn more about now pages</Text>
        </TouchableOpacity>
      </View>

      <GistMenu
        gistId={menuGistId || ''}
        isVisible={menuVisible}
        onClose={() => {
          setMenuVisible(false);
          setMenuGistId(null);
        }}
        onOpenInBrowser={() => menuGistId && handleOpenInBrowser(menuGistId)}
        onClone={() => menuGistId && handleCloneGist(menuGistId)}
        onRename={() => menuGistId && showRenameModal(menuGistId)}
        onDelete={() => menuGistId && handleDeleteGist(menuGistId)}
      />

      <RenameModal
        isVisible={renameModalVisible}
        onClose={() => {
          setRenameModalVisible(false);
          setRenamingGistId(null);
        }}
        onSubmit={(newName) => renamingGistId && handleRenameGist(renamingGistId, newName)}
        currentName={gists.find(g => g.id === renamingGistId)?.description || ''}
        gistId={renamingGistId || ''}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    paddingBottom: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    color: '#1a1a1a',
  },
  userInfo: {
    fontSize: 16,
    marginBottom: 16,
    color: '#4a4a4a',
  },
  button: {
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  loginButton: {
    backgroundColor: '#2ea44f',
    marginTop: 12,
  },
  logoutButton: {
    backgroundColor: '#dc3545',
  },
  createButton: {
    backgroundColor: '#007AFF',
    marginTop: 12,
  },
  retryButton: {
    backgroundColor: '#6c757d',
    marginTop: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4a4a4a',
    marginBottom: 16,
  },
  link: {
    padding: 8,
  },
  linkText: {
    color: '#007AFF',
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  error: {
    color: '#dc3545',
    fontSize: 16,
    marginBottom: 16,
  },
  gistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 8,
    marginBottom: 12,
  },
  selectedGist: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f9ff',
  },
  gistInfo: {
    marginLeft: 12,
    flex: 1,
  },
  gistDescription: {
    fontSize: 16,
    color: '#1a1a1a',
    marginBottom: 4,
  },
  gistId: {
    fontSize: 14,
    color: '#6c757d',
  },
  menuButton: {
    padding: 8,
    marginLeft: 8,
    marginRight: -4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    width: '80%',
    maxWidth: 300,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  menuText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#007AFF',
  },
  menuSeparator: {
    height: 1,
    backgroundColor: '#e5e5e5',
    marginHorizontal: 8,
  },
  deleteMenuItem: {
    marginTop: 0,
    paddingTop: 12,
  },
  deleteMenuText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#dc3545',
  },
  renameContainer: {
    padding: 16,
  },
  renameTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#1a1a1a',
  },
  renameInput: {
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  renameButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#6c757d',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
});