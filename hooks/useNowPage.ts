import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useGistSelection } from './useGistSelection';
import { NowPageData } from '../types/now-page';
import { Octokit } from 'octokit';

export function useNowPage() {
  const { token } = useAuth();
  const { selectedGistId } = useGistSelection();
  const [data, setData] = useState<NowPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const octokit = new Octokit({
    auth: token,
  });

  useEffect(() => {
    if (token && selectedGistId) {
      fetchData();
    }
  }, [token, selectedGistId]);

  const fetchData = async () => {
    if (!selectedGistId) {
      setError('No Gist selected');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await octokit.request('GET /gists/{gist_id}', {
        gist_id: selectedGistId,
      });

      const content = response.data.files['now.json']?.content;
      if (content) {
        setData(JSON.parse(content));
      } else {
        setError('now.json not found in the selected Gist');
      }
    } catch (err) {
      setError('Failed to fetch now page data');
      console.error('Error fetching now page:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateData = async (newData: NowPageData) => {
    if (!selectedGistId) {
      throw new Error('No Gist selected');
    }

    try {
      setLoading(true);
      setError(null);

      await octokit.request('PATCH /gists/{gist_id}', {
        gist_id: selectedGistId,
        files: {
          'now.json': {
            content: JSON.stringify(newData, null, 2),
          }
        }
      });

      setData(newData);
    } catch (err) {
      setError('Failed to update now page data');
      console.error('Error updating now page:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    updateData,
    refresh: fetchData,
  };
}