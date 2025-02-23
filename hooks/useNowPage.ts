import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useGistContext } from './GistContext';
import { NowPageData } from '../types/now-page';
import { Octokit } from 'octokit';

interface GistResponse {
  data: {
    files: {
      [key: string]: {
        filename: string;
        content: string;
      } | null;
    };
  };
}

export function useNowPage() {
  const { token } = useAuth();
  const { currentGistId } = useGistContext();
  const [data, setData] = useState<NowPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const octokit = new Octokit({
    auth: token,
  });

  const fetchData = async () => {
    if (!currentGistId) {
      setError('No Gist selected');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await octokit.request('GET /gists/{gist_id}', {
        gist_id: currentGistId,
      }) as GistResponse;

      const nowFile = response.data.files['now.json'];
      if (nowFile && nowFile.content) {
        setData(JSON.parse(nowFile.content));
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

  // Fetch data when the component mounts or when currentGistId/token changes
  useEffect(() => {
    if (token && currentGistId) {
      fetchData();
    } else {
      // Reset data if no gist is selected or no token is available
      setData(null);
    }
  }, [token, currentGistId]);

  const updateData = async (newData: NowPageData) => {
    if (!currentGistId) {
      throw new Error('No Gist selected');
    }

    try {
      setLoading(true);
      setError(null);

      await octokit.request('PATCH /gists/{gist_id}', {
        gist_id: currentGistId,
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