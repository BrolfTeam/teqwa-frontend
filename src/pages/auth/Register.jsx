import { useState, memo, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiPhone, FiUserPlus, FiArrowRight, FiCheck, FiArrowLeft } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { apiService } from '@/lib/apiService';
import IslamicPattern from '@/components/ui/IslamicPattern';
import authLogo from '@/assets/logo.png';

const ROLE_LABELS = {
  admin: 'Administrator',
  staff: 'Staff / Teacher',
  student: 'Student',
  parent: 'Parent',
  member: 'Member / User',
  teacher: 'Staff / Teacher',
};

const Register = memo(() => {
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Client-side validation
    let hasError = false;
    const newErrors = {};

    if (!formData.name) newErrors.name = "Full Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters long";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      // Split name into first and last name
      const nameParts = formData.name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const registerData = {
        username: formData.email.split('@')[0], // Use email prefix as username
        email: formData.email,
        first_name: firstName,
        last_name: lastName,
        phone: formData.phone,
        password: formData.password,
        password_confirm: formData.confirmPassword,
      };

      // Add role if provided and not admin (admin registration typically requires manual approval)
      if (role && role !== 'admin') {
        registerData.role = role;
      }

      const response = await apiService.register(registerData);

      login(response.user, response.tokens);
      toast.success('Account created successfully! Please check your email to verify your account.');
      navigate('/dashboard');
    } catch (error) {
      if (error.status === 400 && error.data) {
        const backendErrors = {};
        if (error.data.email) backendErrors.email = error.data.email[0];
        if (error.data.username) backendErrors.email = "This email prefix is already taken."; // Mapping username to email field for simplicity
        if (error.data.password) backendErrors.password = error.data.password[0];
        if (error.data.first_name) backendErrors.name = error.data.first_name[0];

        if (Object.keys(backendErrors).length > 0) {
          setErrors(backendErrors);
        } else {
          toast.error('Registration failed. Please check your details.');
        }
      } else {
        toast.error(error.message || 'Registration failed. Please try again.');
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
              Join Our Community
            </h1>
            <p className="text-emerald-200/80 text-lg leading-relaxed">
              "The best among you are those who have the best manners and character."
            </p>
            {/* Feature List */}
            <div className="mt-12 space-y-4 text-left inline-block">
              <div className="flex items-center space-x-3 text-emerald-100/90">
                <div className="w-6 h-6 rounded-full bg-emerald-800/50 flex items-center justify-center border border-emerald-500/30">
                  <FiCheck className="w-3 h-3 text-amber-400" />
                </div>
                <span>Access exclusive educational content</span>
              </div>
              <div className="flex items-center space-x-3 text-emerald-100/90">
                <div className="w-6 h-6 rounded-full bg-emerald-800/50 flex items-center justify-center border border-emerald-500/30">
                  <FiCheck className="w-3 h-3 text-amber-400" />
                </div>
                <span>Book facilities and events easily</span>
              </div>
              <div className="flex items-center space-x-3 text-emerald-100/90">
                <div className="w-6 h-6 rounded-full bg-emerald-800/50 flex items-center justify-center border border-emerald-500/30">
                  <FiCheck className="w-3 h-3 text-amber-400" />
                </div>
                <span>Connect with the community</span>
              </div>
            </div>
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
            className="w-full max-w-md space-y-6"
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
              <h2 className="text-2xl font-bold text-emerald-950 font-serif">Create Account</h2>
              {role && (
                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm">
                  <FiUser className="h-3 w-3" />
                  <span>{ROLE_LABELS[role] || role}</span>
                </div>
              )}
              <p className="text-stone-500 mt-2">Join us today</p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-xl border border-stone-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-600 via-amber-500 to-emerald-600" />

              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-bold text-emerald-950 font-serif">Sign Up</h2>
                  {role && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm">
                      <FiUser className="h-3 w-3" />
                      <span>{ROLE_LABELS[role] || role}</span>
                    </div>
                  )}
                </div>
                <p className="text-stone-500 text-sm">Fill in your details to create your account</p>
                {role && (
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => navigate('/role-selection')}
                      className="text-xs text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-medium flex items-center gap-1"
                    >
                      <FiArrowLeft className="h-3 w-3" />
                      Change role
                    </button>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-emerald-900 block pl-1">
                    Full Name *
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FiUser className={`h-5 w-5 transition-colors ${errors.name ? 'text-red-500' : 'text-emerald-700/50 group-focus-within:text-amber-600'}`} />
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      className={`block w-full pl-11 pr-4 py-3 bg-stone-50 border rounded-xl placeholder-stone-400 focus:outline-none focus:ring-2 transition-all ${errors.name
                          ? 'border-red-500 focus:ring-red-500/20 focus:border-red-600 text-red-900'
                          : 'border-stone-200 text-emerald-950 focus:ring-emerald-500/20 focus:border-emerald-600'
                        }`}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  {errors.name && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-red-500 pl-1"
                    >
                      {errors.name}
                    </motion.p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-emerald-900 block pl-1">
                    Email Address *
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
                      placeholder="name@example.com"
                      required
                    />
                  </div>
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-red-500 pl-1"
                    >
                      {errors.email}
                    </motion.p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium text-emerald-900 block pl-1">
                    Phone Number
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FiPhone className="h-5 w-5 text-emerald-700/50 group-focus-within:text-amber-600 transition-colors" />
                    </div>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className="block w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-emerald-950 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium text-emerald-900 block pl-1">
                      Password *
                    </label>
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
                        className={`block w-full pl-11 pr-10 py-3 bg-stone-50 border rounded-xl placeholder-stone-400 focus:outline-none focus:ring-2 transition-all text-sm ${errors.password
                            ? 'border-red-500 focus:ring-red-500/20 focus:border-red-600 text-red-900'
                            : 'border-stone-200 text-emerald-950 focus:ring-emerald-500/20 focus:border-emerald-600'
                          }`}
                        placeholder="Min. 8 chars"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-emerald-700 transition-colors"
                      >
                        {showPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-red-500 pl-1"
                      >
                        {errors.password}
                      </motion.p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="text-sm font-medium text-emerald-900 block pl-1">
                      Confirm *
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FiLock className={`h-5 w-5 transition-colors ${errors.confirmPassword ? 'text-red-500' : 'text-emerald-700/50 group-focus-within:text-amber-600'}`} />
                      </div>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`block w-full pl-11 pr-10 py-3 bg-stone-50 border rounded-xl placeholder-stone-400 focus:outline-none focus:ring-2 transition-all text-sm ${errors.confirmPassword
                            ? 'border-red-500 focus:ring-red-500/20 focus:border-red-600 text-red-900'
                            : 'border-stone-200 text-emerald-950 focus:ring-emerald-500/20 focus:border-emerald-600'
                          }`}
                        placeholder="Confirm"
                        required
                        onPaste={(e) => e.preventDefault()}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-emerald-700 transition-colors"
                      >
                        {showConfirmPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-red-500 pl-1"
                      >
                        {errors.confirmPassword}
                      </motion.p>
                    )}
                  </div>
                </div>

                <div className="flex items-start space-x-3 pt-2">
                  <div className="flex h-6 items-center">
                    <input
                      id="terms"
                      name="terms"
                      type="checkbox"
                      className="h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-600"
                      required
                    />
                  </div>
                  <div className="text-sm leading-6">
                    <label htmlFor="terms" className="font-medium text-stone-600">
                      I agree to the{' '}
                      <Link to="/terms" className="text-emerald-700 hover:text-amber-600 transition-colors underline decoration-emerald-700/30 underline-offset-2">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link to="/privacy" className="text-emerald-700 hover:text-amber-600 transition-colors underline decoration-emerald-700/30 underline-offset-2">
                        Privacy Policy
                      </Link>
                    </label>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl shadow-lg shadow-emerald-900/20 transition-all duration-300 transform hover:-translate-y-0.5 mt-2"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                      <span>Creating Account...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2 font-medium">
                      <FiUserPlus className="h-5 w-5" />
                      <span>Create Account</span>
                    </div>
                  )}
                </Button>
              </form>

              <div className="mt-8 text-center pt-6 border-t border-stone-100 space-y-2">
                <p className="text-stone-500 text-sm">
                  Already have an account?{' '}
                  <Link
                    to={role ? `/login?role=${role}` : "/login"}
                    className="font-semibold text-emerald-700 hover:text-amber-600 transition-colors"
                  >
                    Sign in
                  </Link>
                </p>
                {!role && (
                  <p className="text-stone-500 text-xs">
                    Need to select your role?{' '}
                    <Link
                      to="/role-selection"
                      className="font-medium text-emerald-700 hover:text-amber-600 transition-colors"
                    >
                      Choose Role
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

Register.displayName = 'Register';
export default Register;