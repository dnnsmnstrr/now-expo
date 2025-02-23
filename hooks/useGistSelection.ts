import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Octokit } from 'octokit';

interface Gist {
  id: string;
  description: string;
  files: {
    [key: string]: {
      filename: string;
      content: string;
    };
  };
}

export function useGistSelection() {
  const [selectedGistId, setSelectedGistId] = useState<string | null>(null);
  const [gists, setGists] = useState<Gist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('selected_gist_id').then(id => {
      if (id) setSelectedGistId(id);
    });
  }, []);

  const fetchGists = async (token: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const octokit = new Octokit({ auth: token });
      const response = await octokit.request('GET /gists');
      const nowGists = response.data.filter(gist => 
        Object.keys(gist.files).some(filename => filename === 'now.json')
      );
      setGists(nowGists);
      
      // If we have a selected gist, verify it still exists
      if (selectedGistId) {
        const stillExists = nowGists.some(gist => gist.id === selectedGistId);
        if (!stillExists) {
          await AsyncStorage.removeItem('selected_gist_id');
          setSelectedGistId(null);
        }
      }
      
      // If we find exactly one now.json gist, select it automatically
      if (nowGists.length === 1 && !selectedGistId) {
        await selectGist(nowGists[0].id);
      }
    } catch (err) {
      setError('Failed to fetch gists');
      console.error('Error fetching gists:', err);
    } finally {
      setLoading(false);
    }
  };

  const createGist = async (token: string) => {
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
      
      await selectGist(response.data.id);
      await fetchGists(token); // Refresh the list
    } catch (err) {
      setError('Failed to create gist');
      console.error('Error creating gist:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const selectGist = async (gistId: string) => {
    await AsyncStorage.setItem('selected_gist_id', gistId);
    setSelectedGistId(gistId);
  };

  return {
    selectedGistId,
    gists,
    loading,
    error,
    fetchGists,
    createGist,
    selectGist,
  };
} 