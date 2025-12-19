import { useState, memo, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiLogIn, FiArrowRight, FiArrowLeft, FiUser } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { apiService } from '@/lib/apiService';
import IslamicPattern from '@/components/ui/IslamicPattern';
import authLogo from '@/assets/logo.png';
import { useTranslation } from 'react-i18next';

const Login = memo(() => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const ROLE_LABELS = {
    admin: t('auth.roleLabels.admin'),
    staff: t('auth.roleLabels.staff'),
    student: t('auth.roleLabels.student'),
    parent: t('auth.roleLabels.parent'),
    member: t('auth.roleLabels.member'),
    teacher: t('auth.roleLabels.teacher'),
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user types
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: '',
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!formData.email || !formData.password) {
      toast.error(t('auth.loginPage.fillAllFields'));
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiService.login({
        email: formData.email,
        password: formData.password,
      });

      login(response.user, response.tokens);
      toast.success(t('auth.loginPage.loginSuccessful'));
      navigate('/dashboard');
    } catch (error) {
      if (error.status === 400 || error.status === 401) {
        // Handle field-specific errors if available, or generic credential error
        if (error.data) {
          const newErrors = {};
          if (error.data.email) newErrors.email = error.data.email[0];
          if (error.data.password) newErrors.password = error.data.password[0];
          if (error.data.detail) toast.error(error.data.detail);

          if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
          } else if (!error.data.detail) {
            toast.error(t('auth.loginPage.invalidCredentials'));
          }
        } else {
          toast.error(t('auth.loginPage.invalidCredentials'));
        }
      } else {
        toast.error(error.message || t('auth.loginPage.loginFailed'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex bg-stone-50 overflow-hidden">
      {/* Decorative Side (Left) */}
      <div className="hidden lg:flex w-1/2 bg-emerald-900 relative items-center justify-center text-white p-12 h-full">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <IslamicPattern className="w-full h-full" color="#FBBF24" opacity={0.1} />
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/50 to-emerald-950/90" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-lg text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="mx-auto mb-8 flex items-center justify-center">
              <img 
                src={authLogo} 
                alt="Teqwa Logo" 
                className="w-20 h-20 object-contain drop-shadow-lg"
              />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-serif mb-4 text-emerald-50">
              {t('auth.loginPage.welcomeBack')}
            </h1>
            <p className="text-emerald-200/80 text-lg leading-relaxed">
              "{t('auth.loginPage.quote')}"
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mt-8 opacity-50" />
          </motion.div>
        </div>
      </div>

      {/* Form Side (Right) */}
      <div className="w-full lg:w-1/2 h-full overflow-y-auto">
        <div className="min-h-full flex items-center justify-center p-6 lg:p-12">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full max-w-md space-y-8"
          >
            {/* Mobile Header */}
            <div className="lg:hidden text-center mb-8">
              <div className="mx-auto mb-4 flex items-center justify-center">
                <img 
                  src={authLogo} 
                  alt="Teqwa Logo" 
                  className="w-16 h-16 object-contain"
                />
              </div>
              <h2 className="text-2xl font-bold text-emerald-950 font-serif">Welcome Back</h2>
              {role && (
                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm">
                  <FiUser className="h-3 w-3" />
                  <span>{ROLE_LABELS[role] || role}</span>
                </div>
              )}
              <p className="text-stone-500 mt-2">Sign in to continue</p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-xl border border-stone-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-600 via-amber-500 to-emerald-600" />

              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-bold text-emerald-950 font-serif">{t('auth.loginPage.signIn')}</h2>
                  {role && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm">
                      <FiUser className="h-3 w-3" />
                      <span>{ROLE_LABELS[role] || role}</span>
                    </div>
                  )}
                </div>
                <p className="text-stone-500 text-sm">{t('auth.loginPage.pleaseEnterDetails')}</p>
                {role && (
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => navigate(role === 'admin' ? '/login' : `/register?role=${role}`)}
                      className="text-xs text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-medium flex items-center gap-1"
                    >
                      <FiArrowLeft className="h-3 w-3" />
                      {t('auth.loginPage.changeRole')}
                    </button>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-emerald-900 block pl-1">
                    Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FiMail className={`h-5 w-5 transition-colors ${errors.email ? 'text-red-500' : 'text-emerald-700/50 group-focus-within:text-amber-600'}`} />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`block w-full pl-11 pr-4 py-3 bg-stone-50 border rounded-xl placeholder-stone-400 focus:outline-none focus:ring-2 transition-all ${errors.email
                        ? 'border-red-500 focus:ring-red-500/20 focus:border-red-600 text-red-900'
                        : 'border-stone-200 text-emerald-950 focus:ring-emerald-500/20 focus:border-emerald-600'
                        }`}
                      placeholder={t('auth.loginPage.emailPlaceholder')}
                      required
                    />
                  </div>
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-red-500 pl-1"
                    >
                      {errors.email}
                    </motion.p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between pl-1">
                    <label htmlFor="password" className="text-sm font-medium text-emerald-900">
                      {t('auth.password')}
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-xs font-medium text-amber-600 hover:text-amber-700 transition-colors"
                    >
                      {t('auth.forgotPassword')}
                    </Link>
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FiLock className={`h-5 w-5 transition-colors ${errors.password ? 'text-red-500' : 'text-emerald-700/50 group-focus-within:text-amber-600'}`} />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      className={`block w-full pl-11 pr-12 py-3 bg-stone-50 border rounded-xl placeholder-stone-400 focus:outline-none focus:ring-2 transition-all ${errors.password
                        ? 'border-red-500 focus:ring-red-500/20 focus:border-red-600 text-red-900'
                        : 'border-stone-200 text-emerald-950 focus:ring-emerald-500/20 focus:border-emerald-600'
                        }`}
                      placeholder={t('auth.loginPage.passwordPlaceholder')}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-stone-400 hover:text-emerald-700 transition-colors"
                    >
                      {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-red-500 pl-1"
                    >
                      {errors.password}
                    </motion.p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl shadow-lg shadow-emerald-900/20 transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                      <span>{t('auth.loginPage.signingIn')}</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2 font-medium">
                      <span>{t('auth.loginPage.signInButton')}</span>
                      <FiArrowRight className="h-5 w-5 text-amber-400" />
                    </div>
                  )}
                </Button>
              </form>

              <div className="mt-8 text-center pt-6 border-t border-stone-100 space-y-2">
                <p className="text-stone-500 text-sm">
                  {t('auth.dontHaveAccount')}{' '}
                  <Link
                    to={role ? `/register?role=${role}` : "/role-selection"}
                    className="font-semibold text-emerald-700 hover:text-amber-600 transition-colors"
                  >
                    {t('auth.loginPage.createAccount')}
                  </Link>
                </p>
                {!role && (
                  <p className="text-stone-500 text-xs">
                    {t('auth.roleSelection.selectRole')}{' '}
                    <Link
                      to="/role-selection"
                      className="font-medium text-emerald-700 hover:text-amber-600 transition-colors"
                    >
                      {t('auth.loginPage.chooseRole')}
                    </Link>
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
});

Login.displayName = 'Login';
export default Login;