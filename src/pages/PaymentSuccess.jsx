import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiXCircle, FiLoader } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import paymentService from '@/services/paymentService'; // We will add a verify method here soon

const PaymentSuccess = () => {
    const { txRef } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying'); // verifying, success, failed
    const [message, setMessage] = useState('Verifying your payment...');

    useEffect(() => {
        const verifyPayment = async () => {
            if (!txRef) {
                setStatus('failed');
                setMessage('Invalid payment reference.');
                return;
            }

            try {
                // Call backend to verify
                const response = await paymentService.verifyPayment(txRef);

                if (response && response.status === 'success' && response.data.status === 'success') {
                    setStatus('success');
                    setMessage('Payment confirmed successfully!');
                    // Dispatch event to refresh dashboard when payment is completed
                    window.dispatchEvent(new CustomEvent('custom:data-change', { detail: { type: 'donation:completed' } }));
                } else {
                    console.error('Payment verification failed:', response);
                    setStatus('failed');
                    setMessage('Payment verification failed. Please try again or contact support.');
                }
            } catch (error) {
                console.error('Verification error:', error);

                // Fallback: If verifying fails (e.g. network), but we are here, we might just show pending
                // But better to be honest
                setStatus('failed');
                setMessage('Could not verify payment status. Please contact support if you were charged.');
            }
        };

        verifyPayment();
    }, [txRef]);

    return (
        <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center"
            >
                {status === 'verifying' && (
                    <div className="flex flex-col items-center space-y-4">
                        <FiLoader className="h-16 w-16 text-primary animate-spin" />
                        <h2 className="text-2xl font-bold">Verifying Payment</h2>
                        <p className="text-muted-foreground">{message}</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center space-y-4">
                        <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center">
                            <FiCheckCircle className="h-10 w-10 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-green-600">Thank You!</h2>
                        <p className="text-gray-600 dark:text-gray-300">{message}</p>
                        <div className="pt-4">
                            <Button onClick={() => navigate('/')} variant="primary">Return Home</Button>
                        </div>
                    </div>
                )}

                {status === 'failed' && (
                    <div className="flex flex-col items-center space-y-4">
                        <div className="h-20 w-20 bg-red-100 rounded-full flex items-center justify-center">
                            <FiXCircle className="h-10 w-10 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-red-600">Payment Failed</h2>
                        <p className="text-gray-600 dark:text-gray-300">{message}</p>
                        <div className="flex gap-3 pt-4">
                            <Button onClick={() => navigate('/contact')} variant="outline">Contact Support</Button>
                            <Button onClick={() => navigate('/')} variant="ghost">Return Home</Button>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default PaymentSuccess;
