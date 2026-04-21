import { FileText, Clock, Plus } from 'lucide-react';
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
}

export function Sidebar({ recentSummaries, onSelectSummary, onNewChat, userName, onLogout }: SidebarProps) {
  const { t } = useLanguage();

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
            <button
              key={summary.id}
              onClick={() => onSelectSummary(summary.id)}
              className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-sidebar-accent transition-all duration-200 group"
            >
              <div className="text-sidebar-foreground/90 font-['Inter'] group-hover:text-sidebar-foreground transition-colors" style={{ fontSize: '0.875rem' }}>
                {summary.title}
              </div>
              <div className="text-muted-foreground font-['Inter'] mt-0.5" style={{ fontSize: '0.75rem' }}>
                {summary.date}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-sidebar-border">
        <SettingsDropdown userName={userName} onLogout={onLogout} />
      </div>
    </div>
  );
}
