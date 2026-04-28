import { useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { api } from '../api';

interface AuthProps {
  onAuth: (user: { name: string; username: string }) => void;
}

interface FormDataState {
  username: string;
  identifier: string;
  password: string;
}

interface FormErrors {
  username?: string;
  identifier?: string;
  password?: string;
  form?: string;
}

const USERNAME_PATTERN = /^[\w.@+-]+$/;

export function Auth({ onAuth }: AuthProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormDataState>({
    username: '',
    identifier: '',
    password: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const { t } = useLanguage();

  const setField = (field: keyof FormDataState, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined, form: undefined }));
  };

  const validate = (): FormErrors => {
    const nextErrors: FormErrors = {};
    const username = formData.username.trim();
    const identifier = formData.identifier.trim();
    const password = formData.password;

    if (isSignUp) {
      if (!username) {
        nextErrors.username = 'Enter a username.';
      } else if (username.length < 3) {
        nextErrors.username = 'Username must be at least 3 characters long.';
      } else if (username.length > 30) {
        nextErrors.username = 'Username must be 30 characters or fewer.';
      } else if (!USERNAME_PATTERN.test(username)) {
        nextErrors.username = 'Use only letters, numbers, and ./+/-/_/@ in the username.';
      }

      if (!identifier) {
        nextErrors.identifier = 'Enter your email address.';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) {
        nextErrors.identifier = 'Enter a valid email address.';
      }
    } else if (!identifier) {
      nextErrors.identifier = 'Enter your email or username.';
    }

    if (!password) {
      nextErrors.password = 'Enter your password.';
    } else if (isSignUp && password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters long.';
    }

    return nextErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const username = formData.username.trim();
    const identifier = formData.identifier.trim();

    setIsSubmitting(true);
    setErrors({});

    try {
      if (isSignUp) {
        await api.register({
          username,
          email: identifier,
          password: formData.password
        });
      }

      const { access, refresh } = await api.login({
        username: isSignUp ? username : identifier,
        password: formData.password
      });

      localStorage.setItem('access', access);
      localStorage.setItem('refresh', refresh);

      onAuth({
        name: username || identifier,
        username: username || identifier
      });
    } catch (err: any) {
      const fieldErrors = err?.fieldErrors as FormErrors | undefined;
      if (fieldErrors && Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors);
      } else {
        setErrors({ form: err?.message || 'Authentication failed' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputBaseClassName =
    'w-full px-4 py-3 rounded-xl bg-input border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 font-[\'Inter\']';

  const getInputClassName = (hasError: boolean) =>
    `${inputBaseClassName} ${hasError ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'border-border'}`;

  return (
    <div className="min-h-screen flex bg-background">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0e1729] via-[#0f1b2e] to-[#0a1220] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#22d3ee]/20 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjA1Ii8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40"></div>
        <div className="absolute top-20 right-20 w-96 h-96 bg-[#22d3ee]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-[#06b6d4]/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#22d3ee]/20 backdrop-blur-sm border border-[#22d3ee]/30">
              <Sparkles className="w-7 h-7 text-[#22d3ee]" />
            </div>
            <h1 className="font-['Inter']" style={{ fontSize: '1.5rem' }}>
              {t('appName')}
            </h1>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="font-['Inter'] mb-3" style={{ fontSize: '2.5rem', lineHeight: '1.2' }}>
                {t('aiPoweredSummarization')}
              </h2>
              <p className="text-white/80 font-['Inter']" style={{ fontSize: '1.125rem' }}>
                {t('aiPoweredDescription')}
              </p>
            </div>

            <div className="grid gap-4">
              {[
                { title: t('smartAnalysis'), desc: t('smartAnalysisDesc') },
                { title: t('multiFormat'), desc: t('multiFormatDesc') },
                { title: t('instantResults'), desc: t('instantResultsDesc') }
              ].map((feature, idx) => (
                <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-[#22d3ee]/20 hover:border-[#22d3ee]/40 transition-all duration-200">
                  <div className="w-8 h-8 rounded-lg bg-[#22d3ee]/20 flex items-center justify-center flex-shrink-0 mt-0.5 border border-[#22d3ee]/30">
                    <span className="text-[#22d3ee] font-['Inter']">{idx + 1}</span>
                  </div>
                  <div>
                    <div className="font-['Inter'] mb-1">{feature.title}</div>
                    <div className="text-white/70 font-['Inter']" style={{ fontSize: '0.875rem' }}>
                      {feature.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-white/60 font-['Inter']" style={{ fontSize: '0.875rem' }}>
            {t('copyright')}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <div className="lg:hidden flex items-center gap-3 mb-8">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <Sparkles className="w-7 h-7 text-primary" />
              </div>
              <h1 className="text-foreground font-['Inter']" style={{ fontSize: '1.5rem' }}>
                {t('appName')}
              </h1>
            </div>

            <h2 className="text-foreground font-['Inter'] mb-2" style={{ fontSize: '1.875rem' }}>
              {isSignUp ? t('createAccount') : t('welcomeBack')}
            </h2>
            <p className="text-muted-foreground font-['Inter']" style={{ fontSize: '0.9375rem' }}>
              {isSignUp ? t('signUpDescription') : t('signInDescription')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {errors.form && (
              <div className="p-3 rounded-lg bg-red-500/15 border border-red-500/40 text-red-300 text-sm">
                {errors.form}
              </div>
            )}

            {isSignUp && (
              <div>
                <label className="block text-foreground mb-2 font-['Inter']" style={{ fontSize: '0.875rem' }}>
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setField('username', e.target.value)}
                  className={getInputClassName(Boolean(errors.username))}
                  placeholder="johndoe"
                  autoComplete="username"
                  required={isSignUp}
                />
                {errors.username && (
                  <p className="mt-2 text-sm text-red-400">{errors.username}</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-foreground mb-2 font-['Inter']" style={{ fontSize: '0.875rem' }}>
                {isSignUp ? 'Email' : 'Email or username'}
              </label>
              <input
                type={isSignUp ? 'email' : 'text'}
                value={formData.identifier}
                onChange={(e) => setField('identifier', e.target.value)}
                className={getInputClassName(Boolean(errors.identifier))}
                placeholder={isSignUp ? 'your@email.com' : 'email or username'}
                autoComplete={isSignUp ? 'email' : 'username'}
                required
              />
              {errors.identifier && (
                <p className="mt-2 text-sm text-red-400">{errors.identifier}</p>
              )}
            </div>

            <div>
              <label className="block text-foreground mb-2 font-['Inter']" style={{ fontSize: '0.875rem' }}>
                {t('password')}
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setField('password', e.target.value)}
                className={getInputClassName(Boolean(errors.password))}
                placeholder="********"
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                required
              />
              {errors.password && (
                <p className="mt-2 text-sm text-red-400">{errors.password}</p>
              )}
            </div>

            {!isSignUp && (
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-primary hover:text-primary/80 transition-colors font-['Inter']"
                  style={{ fontSize: '0.875rem' }}
                >
                  {t('forgotPassword')}
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed text-white transition-all duration-200 shadow-lg hover:shadow-xl font-['Inter'] flex items-center justify-center gap-2 group"
            >
              {isSubmitting ? 'Please wait...' : t('continue')}
              {!isSubmitting && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setErrors({});
                }}
                className="text-muted-foreground hover:text-foreground transition-colors font-['Inter']"
                style={{ fontSize: '0.875rem' }}
              >
                {isSignUp ? t('haveAccount') : t('noAccount')}{' '}
                <span className="text-primary">
                  {isSignUp ? t('signIn') : t('signUp')}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
