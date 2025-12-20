import { useState, memo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiArrowLeft, FiSend } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { toast } from 'sonner';
import { apiService } from '@/lib/apiService';
import { useTranslation } from 'react-i18next';

const ForgotPassword = memo(() => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            toast.error(t('auth.forgotPasswordPage.enterEmailAddress'));
            return;
        }

        setIsLoading(true);

        try {
            await apiService.requestPasswordReset(email);
            setEmailSent(true);
            toast.success(t('auth.forgotPasswordPage.passwordResetSent'));
        } catch (error) {
            toast.error(error.message || t('auth.forgotPasswordPage.failedToSend'));
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
                        <CardTitle className="text-2xl font-bold">{t('auth.forgotPasswordPage.title')}</CardTitle>
                        <p className="text-muted-foreground">
                            {emailSent
                                ? t('auth.forgotPasswordPage.checkEmail')
                                : t('auth.forgotPasswordPage.enterEmail')
                            }
                        </p>
                    </CardHeader>
                    <CardContent>
                        {!emailSent ? (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                                        {t('auth.forgotPasswordPage.emailAddress')}
                                    </label>
                                    <div className="relative">
                                        <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            placeholder={t('auth.forgotPasswordPage.emailPlaceholder')}
                                            required
                                        />
                                    </div>
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
                                            <span>{t('auth.forgotPasswordPage.sending')}</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center space-x-2">
                                            <FiSend className="h-4 w-4" />
                                            <span>{t('auth.forgotPasswordPage.sendResetLink')}</span>
                                        </div>
                                    )}
                                </Button>
                            </form>
                        ) : (
                            <div className="space-y-4">
                                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                    <p className="text-sm text-green-800 dark:text-green-200">
                                        {t('auth.forgotPasswordPage.resetLinkSent')} <strong>{email}</strong>.
                                        {t('auth.forgotPasswordPage.checkInbox')}
                                    </p>
                                </div>

                                <Button
                                    onClick={() => setEmailSent(false)}
                                    variant="outline"
                                    className="w-full"
                                >
                                    {t('auth.forgotPasswordPage.sendAnotherLink')}
                                </Button>
                            </div>
                        )}

                        <div className="mt-6 text-center">
                            <Link
                                to="/login"
                                className="inline-flex items-center space-x-2 text-sm text-primary hover:text-primary/80 transition-colors"
                            >
                                <FiArrowLeft className="h-4 w-4" />
                                <span>{t('auth.forgotPasswordPage.backToLogin')}</span>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
});

ForgotPassword.displayName = 'ForgotPassword';
export default ForgotPassword;
