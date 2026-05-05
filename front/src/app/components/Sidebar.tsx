import { useState } from 'react';
import { createPortal } from 'react-dom';
import { FileText, Clock, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { SettingsDropdown } from './SettingsDropdown';

interface SidebarProps {
  recentSummaries: Array<{
    id: string;
    title: string;
    date: string;
  }>;
  onSelectSummary: (id: string) => void;
  onNewChat: () => void;
  userName: string;
  onLogout: () => void;
  onDeleteSummary: (id: string) => void;
}

export function Sidebar({ recentSummaries, onSelectSummary, onNewChat, userName, onLogout, onDeleteSummary }: SidebarProps) {
  const { t } = useLanguage();
  const [summaryToDelete, setSummaryToDelete] = useState<string | null>(null);

  const confirmDelete = () => {
    if (summaryToDelete) {
      onDeleteSummary(summaryToDelete);
      setSummaryToDelete(null);
    }
  };

  return (
    <div className="w-64 h-full bg-sidebar backdrop-blur-xl border-r border-sidebar-border flex flex-col">
      <div className="p-4 border-b border-sidebar-border">
        <h1 className="flex items-center gap-2 text-sidebar-foreground mb-4">
          <FileText className="w-6 h-6 text-primary" />
          <span className="font-['Inter']">{t('appName')}</span>
        </h1>

        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span className="font-['Inter']" style={{ fontSize: '0.875rem' }}>{t('newSummary')}</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center gap-2 text-muted-foreground mb-3 px-2">
          <Clock className="w-4 h-4" />
          <span className="font-['Inter']" style={{ fontSize: '0.875rem' }}>{t('recentSummaries')}</span>
        </div>

        <div className="space-y-1">
          {recentSummaries.map((summary) => (
            <div key={summary.id} className="relative group flex items-center">
              <button
                onClick={() => onSelectSummary(summary.id)}
                className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-sidebar-accent transition-all duration-200 group-hover:pr-10"
              >
                <div className="text-sidebar-foreground/90 font-['Inter'] transition-colors truncate" style={{ fontSize: '0.875rem' }}>
                  {summary.title}
                </div>
                <div className="text-muted-foreground font-['Inter'] mt-0.5" style={{ fontSize: '0.75rem' }}>
                  {summary.date}
                </div>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSummaryToDelete(summary.id);
                }}
                className="absolute right-2 p-1.5 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                title="Delete summary"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-sidebar-border">
        <SettingsDropdown userName={userName} onLogout={onLogout} />
      </div>

      {summaryToDelete && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-card w-full max-w-sm rounded-2xl p-6 shadow-xl border border-border">
            <div className="flex items-center gap-3 mb-4 text-red-500">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-['Inter'] font-semibold text-lg text-foreground">Удалить саммари?</h3>
            </div>
            <p className="text-muted-foreground font-['Inter'] mb-6 text-sm">
              Вы уверены, что хотите удалить это саммари? Это действие нельзя отменить.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setSummaryToDelete(null)}
                className="px-4 py-2 rounded-xl text-foreground font-['Inter'] text-sm hover:bg-secondary transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl bg-red-500 text-white font-['Inter'] text-sm hover:bg-red-600 transition-colors shadow-sm"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
