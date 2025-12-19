import { useState, memo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiLock, FiEye, FiEyeOff, FiCheck } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { toast } from 'sonner';
import { apiService } from '@/lib/apiService';
import { useTranslation } from 'react-i18next';

const ResetPassword = memo(() => {
    const { t } = useTranslation();
    const { token } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.password || !formData.confirmPassword) {
            toast.error(t('auth.resetPassword.fillAllFields'));
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error(t('auth.resetPassword.passwordsDoNotMatch'));
            return;
        }

        if (formData.password.length < 8) {
            toast.error(t('auth.resetPassword.minLength'));
            return;
        }

        setIsLoading(true);

        try {
            await apiService.confirmPasswordReset(token, formData.password);
            toast.success(t('auth.resetPassword.resetSuccessful'));
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (error) {
            toast.error(error.message || t('auth.resetPassword.resetFailed'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-md"
            >
                <Card className="shadow-xl">
                    <CardHeader className="text-center pb-6">
                        <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
                        <p className="text-muted-foreground">Enter your new password</p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium mb-2">
                                    {t('auth.resetPassword.newPassword')}
                                </label>
                                <div className="relative">
                                    <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-12 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        placeholder={t('auth.resetPassword.newPasswordPlaceholder')}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                                    {t('auth.resetPassword.confirmNewPassword')}
                                </label>
                                <div className="relative">
                                    <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-12 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        placeholder={t('auth.resetPassword.confirmNewPasswordPlaceholder')}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showConfirmPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="text-sm text-muted-foreground">
                                <p>{t('auth.resetPassword.passwordRequirements')}</p>
                                <ul className="list-disc list-inside space-y-1 mt-2">
                                    <li>{t('auth.resetPassword.minLength')}</li>
                                    <li>{t('auth.resetPassword.uppercaseLowercase')}</li>
                                    <li>{t('auth.resetPassword.includeNumber')}</li>
                                </ul>
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-12"
                                size="lg"
                            >
                                {isLoading ? (
                                    <div className="flex items-center space-x-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        <span>{t('auth.resetPassword.resetting')}</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center space-x-2">
                                        <FiCheck className="h-4 w-4" />
                                        <span>{t('auth.resetPassword.resetPasswordButton')}</span>
                                    </div>
                                )}
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-muted-foreground">
                                {t('auth.resetPassword.rememberPassword')}{' '}
                                <Link
                                    to="/login"
                                    className="text-primary hover:text-primary/80 font-medium transition-colors"
                                >
                                    {t('auth.resetPassword.signIn')}
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
});

ResetPassword.displayName = 'ResetPassword';
export default ResetPassword;
