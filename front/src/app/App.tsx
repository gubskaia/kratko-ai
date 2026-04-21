import { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { Sidebar } from './components/Sidebar';
import { UploadZone } from './components/UploadZone';
import { ResultView } from './components/ResultView';
import { Auth } from './components/Auth';
import { SettingsDropdown } from './components/SettingsDropdown';

interface SummaryResult {
  title: string;
  summary: string;
  keyPoints: string[];
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
      const res = await api.uploadFile(file);
      setCurrentResult({
        title: res.title,
        summary: res.summary || 'Processing or completed without summary.',
        keyPoints: [], // Extract logic can be added later or handled by prompt returning markdown
        metadata: {
          wordCount: res.extracted_text?.split(' ').length || 0,
          readTime: 'Unknown',
          confidence: 100
        }
      });
      fetchRecent();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSummary = async (id: string) => {
    try {
      const res = await api.getSummary(id);
      setCurrentResult({
        title: res.title,
        summary: res.status === 'failed' ? `Error: ${res.error_message}` : res.summary,
        keyPoints: [], 
        metadata: {
          wordCount: res.summary?.split(' ').length || 0,
          readTime: 'Unknown',
          confidence: 100
        }
      });
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
            <ResultView result={currentResult} />
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
