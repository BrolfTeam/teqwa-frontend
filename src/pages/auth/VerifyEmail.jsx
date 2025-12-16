import { useState, useEffect, memo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiXCircle, FiMail } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { toast } from 'sonner';
import { apiService } from '@/lib/apiService';
import { useAuth } from '@/context/AuthContext';

const VerifyEmail = memo(() => {
    const { token } = useParams();
    const navigate = useNavigate();
    const { updateUser } = useAuth();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('Verifying your email...');
    const [email, setEmail] = useState('');
    const [isResending, setIsResending] = useState(false);

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                const response = await apiService.verifyEmail(token);
                setStatus('success');
                setMessage(response.message || 'Email verified successfully!');

                // Update user in context if they're logged in
                if (response.user && updateUser) {
                    updateUser(response.user);
                }

                toast.success('Email verified successfully!');

                // Redirect to login after 3 seconds
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } catch (error) {
                setStatus('error');
                setMessage(error.message || 'Failed to verify email. The link may be invalid or expired.');
                toast.error('Email verification failed');
            }
        };

        if (token) {
            verifyEmail();
        }
    }, [token, navigate, updateUser]);

    const handleResendEmail = async () => {
        if (!email) {
            toast.error('Please enter your email address');
            return;
        }

        setIsResending(true);
        try {
            await apiService.resendVerificationEmail(email);
            toast.success('Verification email sent! Check your inbox.');
        } catch (error) {
            toast.error(error.message || 'Failed to resend verification email');
        } finally {
            setIsResending(false);
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
                        <div className="flex justify-center mb-4">
                            {status === 'verifying' && (
                                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
                            )}
                            {status === 'success' && (
                                <FiCheckCircle className="h-16 w-16 text-green-500" />
                            )}
                            {status === 'error' && (
                                <FiXCircle className="h-16 w-16 text-red-500" />
                            )}
                        </div>
                        <CardTitle className="text-2xl font-bold">
                            {status === 'verifying' && 'Verifying Email'}
                            {status === 'success' && 'Email Verified!'}
                            {status === 'error' && 'Verification Failed'}
                        </CardTitle>
                        <p className="text-muted-foreground mt-2">{message}</p>
                    </CardHeader>
                    <CardContent>
                        {status === 'success' && (
                            <div className="space-y-4">
                                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                    <p className="text-sm text-green-800 dark:text-green-200">
                                        Your email has been verified successfully. You will be redirected to the login page shortly.
                                    </p>
                                </div>

                                <Link to="/login" className="block">
                                    <Button className="w-full">
                                        Go to Login
                                    </Button>
                                </Link>
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="space-y-4">
                                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                    <p className="text-sm text-red-800 dark:text-red-200">
                                        The verification link may have expired or is invalid. You can request a new verification email below.
                                    </p>
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <input
                                            type="email"
                                            id="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            placeholder="Enter your email"
                                        />
                                    </div>
                                </div>

                                <Button
                                    onClick={handleResendEmail}
                                    disabled={isResending}
                                    className="w-full"
                                >
                                    {isResending ? 'Sending...' : 'Resend Verification Email'}
                                </Button>

                                <Link to="/login" className="block">
                                    <Button variant="outline" className="w-full">
                                        Back to Login
                                    </Button>
                                </Link>
                            </div>
                        )}

                        {status === 'verifying' && (
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">
                                    Please wait while we verify your email address...
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
});

VerifyEmail.displayName = 'VerifyEmail';
export default VerifyEmail;
