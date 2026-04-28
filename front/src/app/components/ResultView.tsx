import type { ReactNode } from 'react';
import { Sparkles, Copy, Download } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

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

interface ResultViewProps {
  result: SummaryResult | null;
}

export function ResultView({ result }: ResultViewProps) {
  const { t } = useLanguage();

  if (!result) {
    return null;
  }

  const renderStructuredSummary = (summary: string): ReactNode[] => {
    return summary
      .split('\n')
      .map((line) => line.trimEnd())
      .map((line, index, arr) => ({ line, index, prev: arr[index - 1] }))
      .filter(({ line, prev }) => line || prev !== '')
      .map(({ line, index }) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return <div key={`space-${index}`} className="h-3" />;
        }

        const headingMatch = trimmed.match(/^\*\*(.+)\*\*$/);
        if (headingMatch) {
          return (
            <h4 key={`heading-${index}`} className="text-foreground font-['Inter'] mt-6 first:mt-0">
              {headingMatch[1]}
            </h4>
          );
        }

        if (trimmed.startsWith('- ')) {
          return (
            <div
              key={`bullet-${index}`}
              className="flex gap-3 text-foreground/80 font-['Inter']"
              style={{ fontSize: '0.9375rem' }}
            >
              <span className="text-primary mt-0.5">&bull;</span>
              <span>{trimmed.slice(2)}</span>
            </div>
          );
        }

        return (
          <p
            key={`text-${index}`}
            className="text-foreground/70 leading-relaxed font-['Inter']"
            style={{ fontSize: '0.9375rem' }}
          >
            {trimmed}
          </p>
        );
      });
  };

  const handleCopy = () => {
    const text = `${result.title}\n\n${result.summary}\n\nKey Points:\n${result.keyPoints
      .map((point) => `• ${point}`)
      .join('\n')}`;
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="rounded-3xl bg-card backdrop-blur-xl border border-border overflow-hidden shadow-lg">
        <div className="p-8 border-b border-border bg-gradient-to-br from-primary/5 to-transparent">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/20">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-foreground font-['Inter']">
                  {t('aiSummary')}
                </h2>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-white/50 dark:text-white/50 text-muted-foreground font-['Inter']" style={{ fontSize: '0.75rem' }}>
                    {result.metadata.wordCount} {t('words')}
                  </span>
                  <span className="text-white/50 dark:text-white/50 text-muted-foreground font-['Inter']" style={{ fontSize: '0.75rem' }}>
                    {result.metadata.readTime} {t('read')}
                  </span>
                  <span className="text-white/50 dark:text-white/50 text-muted-foreground font-['Inter']" style={{ fontSize: '0.75rem' }}>
                    {result.metadata.confidence}% {t('confidence')}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="p-2.5 rounded-xl bg-secondary hover:bg-secondary/80 border border-border transition-all duration-200 group"
              >
                <Copy className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </button>
              <button className="p-2.5 rounded-xl bg-secondary hover:bg-secondary/80 border border-border transition-all duration-200 group">
                <Download className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-8">
          <h3 className="text-foreground font-['Inter'] mb-4">
            {result.title}
          </h3>

          <div className="mb-8 space-y-3">
            {renderStructuredSummary(result.summary)}
          </div>

          <div className="space-y-6">
            <h4 className="text-foreground font-['Inter']">
              {t('keyPoints')}
            </h4>

            <div className="space-y-4">
              {result.keyPoints.map((point, index) => (
                <div
                  key={index}
                  className="flex gap-4 p-4 rounded-2xl bg-secondary border border-border hover:bg-secondary/80 transition-all duration-200"
                >
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
                    <span className="text-primary font-['Inter']" style={{ fontSize: '0.75rem' }}>
                      {index + 1}
                    </span>
                  </div>
                  <p className="text-foreground/80 font-['Inter']" style={{ fontSize: '0.9375rem' }}>
                    {point}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
