import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'ru';

interface Translations {
  en: Record<string, string>;
  ru: Record<string, string>;
}

const translations: Translations = {
  en: {
    appName: 'KratkoAI',
    recentSummaries: 'Recent Summaries',
    settings: 'Settings',
    transformDocuments: 'Transform documents into insights',
    uploadDescription: 'Upload any document and let AI extract the key information in seconds',
    dropDocument: 'Drop your document here',
    orClickBrowse: 'or click to browse files',
    aiSummary: 'AI Summary',
    words: 'words',
    read: 'read',
    confidence: 'confidence',
    keyPoints: 'Key Points',
    summarizeAnother: 'Summarize another document',
    theme: 'Theme',
    language: 'Language',
    dark: 'Dark',
    light: 'Light',
    english: 'English',
    russian: 'Russian',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    email: 'Email',
    password: 'Password',
    fullName: 'Full Name',
    forgotPassword: 'Forgot password?',
    noAccount: "Don't have an account?",
    haveAccount: 'Already have an account?',
    continue: 'Continue',
    welcomeBack: 'Welcome back',
    signInDescription: 'Sign in to your account to continue',
    createAccount: 'Create account',
    signUpDescription: 'Get started with KratkoAI today',
    logout: 'Logout',
    newSummary: 'New Summary',
    aiPoweredSummarization: 'AI-Powered Document Summarization',
    aiPoweredDescription: 'Transform lengthy documents into concise, actionable insights in seconds.',
    smartAnalysis: 'Smart Analysis',
    smartAnalysisDesc: 'Advanced AI extracts key points automatically',
    multiFormat: 'Multi-Format',
    multiFormatDesc: 'Support for PDF, DOCX, and TXT files',
    instantResults: 'Instant Results',
    instantResultsDesc: 'Get summaries in seconds, not hours',
    copyright: '© 2026 KratkoAI. All rights reserved.'
  },
  ru: {
    appName: 'KratkoAI',
    recentSummaries: 'Недавние сводки',
    settings: 'Настройки',
    transformDocuments: 'Превращайте документы в идеи',
    uploadDescription: 'Загрузите любой документ и позвольте ИИ извлечь ключевую информацию за секунды',
    dropDocument: 'Перетащите документ сюда',
    orClickBrowse: 'или нажмите для выбора файлов',
    aiSummary: 'ИИ Сводка',
    words: 'слов',
    read: 'чтение',
    confidence: 'уверенность',
    keyPoints: 'Ключевые моменты',
    summarizeAnother: 'Обработать другой документ',
    theme: 'Тема',
    language: 'Язык',
    dark: 'Темная',
    light: 'Светлая',
    english: 'Английский',
    russian: 'Русский',
    signIn: 'Вход',
    signUp: 'Регистрация',
    email: 'Email',
    password: 'Пароль',
    fullName: 'Полное имя',
    forgotPassword: 'Забыли пароль?',
    noAccount: 'Нет аккаунта?',
    haveAccount: 'Уже есть аккаунт?',
    continue: 'Продолжить',
    welcomeBack: 'С возвращением',
    signInDescription: 'Войдите в свой аккаунт, чтобы продолжить',
    createAccount: 'Создать аккаунт',
    signUpDescription: 'Начните работу с KratkoAI сегодня',
    logout: 'Выход',
    newSummary: 'Новая сводка',
    aiPoweredSummarization: 'Суммаризация документов с помощью ИИ',
    aiPoweredDescription: 'Превращайте длинные документы в краткие, полезные инсайты за секунды.',
    smartAnalysis: 'Умный анализ',
    smartAnalysisDesc: 'Передовой ИИ автоматически извлекает ключевые моменты',
    multiFormat: 'Мульти-формат',
    multiFormatDesc: 'Поддержка файлов PDF, DOCX и TXT',
    instantResults: 'Мгновенные результаты',
    instantResultsDesc: 'Получайте сводки за секунды, а не часы',
    copyright: '© 2026 KratkoAI. Все права защищены.'
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
