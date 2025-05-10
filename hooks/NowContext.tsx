import React, { createContext, useContext, useState, useEffect } from 'react';
import { Octokit } from 'octokit';
import { useAuth } from './useAuth';
import { useGistContext } from './GistContext';
import { NowPageData } from '../types/now-page';

interface GistResponse {
  data: {
    updated_at: string;
    created_at: string;
    history: Array<{
      version: string;
      committed_at: string;
      url: string;
      change_status: {
        total: number;
        additions: number;
        deletions: number;
      };
    }>;
    files: {
      [key: string]: {
        filename: string;
        content: string;
      } | null;
    };
  };
}

interface VersionResponse {
  updated_at: string;
  created_at: string;
  files: {
    [key: string]: {
      filename: string;
      content: string;
    } | null;
  };
}

interface NowContextType {
  data: NowPageData | null;
  loading: boolean;
  error: string | null;
  updateData: (newData: NowPageData) => Promise<void>;
  refresh: () => Promise<void>;
  versionHistory: Array<{
    version: string;
    committed_at: string;
    url: string;
    change_status: {
      total: number;
      additions: number;
      deletions: number;
    };
  }> | null;
  loadVersion: (versionUrl: string) => Promise<void>;
  selectedVersion: string | null;
}

const NowContext = createContext<NowContextType>({
  data: null,
  loading: false,
  error: null,
  updateData: async () => {},
  refresh: async () => {},
  versionHistory: null,
  loadVersion: async () => {},
  selectedVersion: null,
});

export function NowProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const { currentGistId } = useGistContext();
  const [data, setData] = useState<NowPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [versionHistory, setVersionHistory] = useState<NowContextType['versionHistory']>(null);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);

  const octokit = new Octokit({
    auth: token,
  });

  const loadVersion = async (versionUrl: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await octokit.request(versionUrl);
      const versionData = response.data as VersionResponse;
      
      const nowFile = versionData.files['now.json'];
      if (nowFile && nowFile.content) {
        const parsedData = JSON.parse(nowFile.content);
        const updatedAt = new Date(versionData.updated_at);
        setData({ ...parsedData, updatedAt });
        setSelectedVersion(versionUrl);
      } else {
        setError('now.json not found in the selected version');
      }
    } catch (err) {
      setError('Failed to load version');
      console.error('Error loading version:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    if (!currentGistId) {
      setError('No Gist selected');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = (await octokit.request('GET /gists/{gist_id}', {
        gist_id: currentGistId,
      })) as GistResponse;

      const nowFile = response.data.files['now.json'];
      if (nowFile && nowFile.content) {
        const parsedData = JSON.parse(nowFile.content);
        const updatedAt = new Date(response.data.updated_at);
        setData({ ...parsedData, updatedAt });
        setVersionHistory(response.data.history);
        setSelectedVersion(null); // Reset selected version when fetching latest
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
          },
        },
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

  return (
    <NowContext.Provider
      value={{
        data,
        loading,
        error,
        updateData,
        refresh: fetchData,
        versionHistory,
        loadVersion,
        selectedVersion,
      }}
    >
      {children}
    </NowContext.Provider>
  );
}

export function useNowPage() {
  return useContext(NowContext);
}
