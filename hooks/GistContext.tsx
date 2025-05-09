import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Octokit } from 'octokit';

interface GistFile {
  filename?: string;
  type?: string;
  language?: string;
  raw_url?: string;
  size?: number;
  truncated?: boolean;
  content?: string;
}

interface Gist {
  url: string;
  forks_url: string;
  commits_url: string;
  id: string;
  node_id: string;
  git_pull_url: string;
  git_push_url: string;
  html_url: string;
  files: { [key: string]: GistFile };
  public: boolean;
  created_at: string;
  updated_at: string;
  description: string | null;
  comments: number;
  user: any;
  comments_url: string;
  owner: any;
  truncated: boolean;
}

interface GistContextType {
  currentGistId: string | null;
  gists: Gist[];
  loading: boolean;
  error: string | null;
  fetchGists: (token: string) => Promise<void>;
  createGist: (token: string) => Promise<string>;
  selectGist: (gistId: string) => Promise<void>;
  cloneGist: (token: string, gistId: string) => Promise<string>;
  deleteGist: (token: string, gistId: string) => Promise<void>;
  renameGist: (token: string, gistId: string, newDescription: string) => Promise<void>;
}

const GistContext = createContext<GistContextType>({
  currentGistId: null,
  gists: [],
  loading: false,
  error: null,
  fetchGists: async () => {},
  createGist: async () => '',
  selectGist: async () => {},
  cloneGist: async () => '',
  deleteGist: async () => {},
  renameGist: async () => {},
});

export function GistProvider({ children }: { children: React.ReactNode }) {
  const [currentGistId, setCurrentGistId] = useState<string | null>(null);
  const [gists, setGists] = useState<Gist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load selected gist on mount
  useEffect(() => {
    AsyncStorage.getItem('selected_gist_id').then(id => {
      if (id) setCurrentGistId(id);
    });
  }, []);

  const fetchGists = async (token: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const octokit = new Octokit({ auth: token });
      const response = await octokit.request('GET /gists');
      const nowGists = (response.data as Gist[]).filter(gist => 
        Object.keys(gist.files).some(filename => filename === 'now.json')
      );
      setGists(nowGists);
      
      // If we have a selected gist, verify it still exists
      if (currentGistId) {
        const stillExists = nowGists.some(gist => gist.id === currentGistId);
        if (!stillExists) {
          await AsyncStorage.removeItem('selected_gist_id');
          setCurrentGistId(null);
        }
      }
      
      // If we find exactly one now.json gist, select it automatically
      if (nowGists.length && !currentGistId) {
        await selectGist(nowGists[0].id);
      }
    } catch (err) {
      setError('Failed to fetch gists');
      console.error('Error fetching gists:', err);
    } finally {
      setLoading(false);
    }
  };

  const createGist = async (token: string): Promise<string> => {
    setLoading(true);
    setError(null);
    
    try {
      const octokit = new Octokit({ auth: token });
      const response = await octokit.request('POST /gists', {
        description: 'My Now Page Data',
        public: false,
        files: {
          'now.json': {
            content: JSON.stringify({
              status: '',
              location: '',
              activities: [],
              plans: [],
              projects: [],
            }, null, 2),
          },
        },
      });
      
      const newGistId = (response.data as Gist).id;
      await selectGist(newGistId);
      await fetchGists(token); // Refresh the list
      return newGistId;
    } catch (err) {
      setError('Failed to create gist');
      console.error('Error creating gist:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cloneGist = async (token: string, gistId: string): Promise<string> => {
    setLoading(true);
    setError(null);
    
    try {
      const octokit = new Octokit({ auth: token });
      
      // First, get the content of the gist to clone
      const sourceGist = await octokit.request('GET /gists/{gist_id}', {
        gist_id: gistId,
      });
      
      // Transform files to match the expected format
      const files: { [key: string]: { content: string } } = {};
      Object.entries(sourceGist.data.files || {}).forEach(([filename, file]) => {
        if (file && file.content) {
          files[filename] = { content: file.content };
        }
      });
      
      // Create a new gist with the same content
      const response = await octokit.request('POST /gists', {
        description: `Clone of ${sourceGist.data.description || 'Now Page Data'}`,
        public: false,
        files,
      });
      
      const newGistId = (response.data as Gist).id;
      await selectGist(newGistId);
      await fetchGists(token); // Refresh the list
      return newGistId;
    } catch (err) {
      setError('Failed to clone gist');
      console.error('Error cloning gist:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const selectGist = async (gistId: string) => {
    await AsyncStorage.setItem('selected_gist_id', gistId);
    setCurrentGistId(gistId);
  };

  const deleteGist = async (token: string, gistId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const octokit = new Octokit({ auth: token });
      await octokit.request('DELETE /gists/{gist_id}', {
        gist_id: gistId,
      });
      
      // If we deleted the currently selected gist, clear it
      if (currentGistId === gistId) {
        await AsyncStorage.removeItem('selected_gist_id');
        setCurrentGistId(null);
      }
      
      await fetchGists(token); // Refresh the list
    } catch (err) {
      setError('Failed to delete gist');
      console.error('Error deleting gist:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const renameGist = async (token: string, gistId: string, newDescription: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const octokit = new Octokit({ auth: token });
      await octokit.request('PATCH /gists/{gist_id}', {
        gist_id: gistId,
        description: newDescription,
      });
      
      await fetchGists(token); // Refresh the list
    } catch (err) {
      setError('Failed to rename gist');
      console.error('Error renaming gist:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <GistContext.Provider 
      value={{ 
        currentGistId, 
        gists, 
        loading, 
        error, 
        fetchGists, 
        createGist,
        cloneGist,
        selectGist,
        deleteGist,
        renameGist
      }}
    >
      {children}
    </GistContext.Provider>
  );
}

export function useGistContext() {
  return useContext(GistContext);
} 