import { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { Sidebar } from './components/Sidebar';
import { UploadZone } from './components/UploadZone';
import { ResultView } from './components/ResultView';
import { Auth } from './components/Auth';
import { SettingsDropdown } from './components/SettingsDropdown';

interface SummaryResult {
  id: string;
  title: string;
  summary: string;
  keyPoints: string[];
  status: string;
  metadata: {
    wordCount: number;
    readTime: string;
    confidence: number;
  };
}

interface User {
  name: string;
  email: string;
}

import { api } from './api';
import { useEffect } from 'react';

function AppContent() {
  const [user, setUser] = useState<User | null>(null);
  const [currentResult, setCurrentResult] = useState<SummaryResult | null>(null);
  const [recentSummaries, setRecentSummaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  const buildResult = (item: any): SummaryResult => {
    const summary =
      item.status === 'failed'
        ? `Error: ${item.error_message || 'Document processing failed.'}`
        : item.status === 'processing' || item.status === 'pending'
          ? 'Document uploaded. Processing is still running, please wait a few seconds.'
          : item.summary || 'Completed, but the server returned an empty summary.';

    const textForCount = item.extracted_text || item.summary || '';

    return {
      id: String(item.id),
      title: item.title,
      summary,
      keyPoints: [],
      status: item.status,
      metadata: {
        wordCount: textForCount ? textForCount.trim().split(/\s+/).length : 0,
        readTime: 'Unknown',
        confidence: item.status === 'completed' ? 100 : 0
      }
    };
  };

  const waitForCompletedSummary = async (id: string) => {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const item = await api.getSummary(id);
      if (item.status !== 'processing' && item.status !== 'pending') {
        return item;
      }

      await new Promise((resolve) => setTimeout(resolve, 1500));
    }

    return api.getSummary(id);
  };

  const fetchRecent = async () => {
    try {
      const data = await api.getRecentSummaries();
      setRecentSummaries(data.map((item: any) => ({
        id: String(item.id),
        title: item.title,
        date: new Date(item.uploaded_at).toLocaleDateString()
      })));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchRecent();
    }
  }, [user]);

  const handleFileUpload = async (file: File) => {
    setLoading(true);
    try {
      const created = await api.uploadFile(file);
      const resolved = created.status === 'processing' || created.status === 'pending'
        ? await waitForCompletedSummary(String(created.id))
        : created;

      setCurrentResult(buildResult(resolved));
      await fetchRecent();
    } catch (err) {
      console.error(err);
      setCurrentResult({
        id: 'error',
        title: file.name,
        summary: err instanceof Error ? `Error: ${err.message}` : 'Error: upload failed.',
        keyPoints: [],
        status: 'failed',
        metadata: {
          wordCount: 0,
          readTime: 'Unknown',
          confidence: 0
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSummary = async (id: string) => {
    try {
      const res = await waitForCompletedSummary(id);
      setCurrentResult(buildResult(res));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentResult(null);
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
  };

  const handleNewChat = () => {
    setCurrentResult(null);
  };

  const handleDeleteSummary = async (id: string) => {
    try {
      await api.deleteSummary(id);
      if (currentResult?.id === id) {
        setCurrentResult(null);
      }
      await fetchRecent();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateSummary = async (id: string, payload: { title?: string; summary?: string }) => {
    try {
      const updated = await api.updateSummary(id, payload);
      if (currentResult?.id === id) {
        setCurrentResult(buildResult(updated));
      }
      if (payload.title) {
        await fetchRecent();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) {
    return <Auth onAuth={setUser} />;
  }

  return (
    <div className="size-full flex bg-background font-['Inter']">
      <Sidebar
        recentSummaries={recentSummaries}
        onSelectSummary={handleSelectSummary}
        onNewChat={handleNewChat}
        userName={user.name}
        onLogout={handleLogout}
        onDeleteSummary={handleDeleteSummary}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="min-h-full p-12 flex flex-col items-center justify-center gap-12">
          {!currentResult && !loading && (
            <>
              <div className="text-center">
                <h2 className="text-foreground mb-3">
                  {t('transformDocuments')}
                </h2>
                <p className="text-muted-foreground" style={{ fontSize: '0.9375rem' }}>
                  {t('uploadDescription')}
                </p>
              </div>
              <UploadZone onFileUpload={handleFileUpload} />
            </>
          )}

          {loading && (
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              <p className="text-muted-foreground">{t('Processing Document...') || 'Processing Document...'}</p>
            </div>
          )}

          {currentResult && !loading && (
            <ResultView result={currentResult} onUpdateSummary={handleUpdateSummary} />
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ThemeProvider>
  );
}
