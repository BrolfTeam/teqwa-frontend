import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiCheck, FiStar, FiAward, FiShield } from 'react-icons/fi';
import Hero from '@/components/ui/Hero';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/Card';
import { apiService } from '@/lib/apiService';
import paymentService from '@/services/paymentService';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { PaymentMethodSelector } from '@/components/payment/PaymentMethodSelector';
import Modal from '@/components/ui/Modal';
import background from '@/assets/background.png';

const Membership = () => {
    const { t } = useTranslation();
    const [tiers, setTiers] = useState([]);
    const [currentMembership, setCurrentMembership] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processingTierId, setProcessingTierId] = useState(null);
    const { isAuthenticated, user } = useAuth();

    // Payment UI State
    const [selectedTier, setSelectedTier] = useState(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [proofFile, setProofFile] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const tiersResponse = await apiService.getMembershipTiers();
                setTiers(tiersResponse.results || tiersResponse.data || []);

                if (isAuthenticated) {
                    try {
                        const myMembershipResponse = await apiService.getMyMembership();
                        if (myMembershipResponse) {
                            setCurrentMembership(myMembershipResponse.data || myMembershipResponse);
                        }
                    } catch (err) {
                        console.log('No active membership found or error fetching.');
                    }
                }
            } catch (error) {
                console.error('Failed to fetch membership data:', error);
                toast.error(t('membership.failedToLoad'));
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [isAuthenticated]);

    const handleJoinClick = (tier) => {
        if (!isAuthenticated) {
            toast.error(t('membership.pleaseLogin'));
            return;
        }
        setSelectedTier(tier);
        setIsPaymentModalOpen(true);
        setPaymentMethod('card');
        setProofFile(null);
    };

    const handleSubscribe = async () => {
        if (!selectedTier) return;

        // Validation for manual payment
        if (paymentMethod === 'manual_qr' && !proofFile) {
            toast.error(t('payment.proofRequired'));
            return;
        }

        setProcessingTierId(selectedTier.id);

        try {
            let membershipResponse;

            if (paymentMethod === 'manual_qr') {
                const formData = new FormData();
                formData.append('tier', selectedTier.id);
                formData.append('payment_method', 'manual_qr');
                formData.append('proof_image', proofFile);

                membershipResponse = await apiService.subscribeToMembership(formData);
                toast.success(t('membership.subscriptionSubmitted'));
            } else {
                // 1. Create Membership Record (Card Flow)
                const apiPayload = {
                    tier: selectedTier.id,
                    payment_method: 'card'
                };

                membershipResponse = await apiService.subscribeToMembership(apiPayload);

                // 2. Initialize Payment
                if (membershipResponse) {
                    const objId = membershipResponse.id || membershipResponse.data?.id;
                    try {
                        const paymentResponse = await paymentService.initializePayment({
                            amount: selectedTier.price,
                            currency: 'ETB',
                            email: user.email,
                            first_name: user.first_name,
                            last_name: user.last_name,
                            phone_number: user.phone || '0900000000',
                            content_type_model: 'usermembership',
                            object_id: objId
                        });

                        if (paymentResponse && paymentResponse.checkout_url) {
                            window.location.href = paymentResponse.checkout_url;
                            return;
                        }
                    } catch (paymentError) {
                        console.error('Payment initialization error:', paymentError);
                        toast.error(t('membership.paymentFailed'));
                    }
                }
                toast.success(t('membership.subscriptionSuccess'));
            }

            setIsPaymentModalOpen(false);
            setSelectedTier(null);

            // Refresh membership data
            // (Assuming existing logic or page reload will handle status update display eventually)

        } catch (error) {
            console.error('Join failed:', error);
            toast.error(t('membership.failedToProcess'));
        } finally {
            setProcessingTierId(null);
        }
    };

    const getIcon = (iconName) => {
        switch (iconName) {
            case 'FiAward': return <FiAward className="w-6 h-6" />;
            case 'FiShield': return <FiShield className="w-6 h-6" />;
            default: return <FiStar className="w-6 h-6" />;
        }
    };

    return (
        <div className="min-h-screen bg-background font-sans">
            <Hero
                title={t('membership.title')}
                subtitle={t('membership.subtitle')}
                backgroundImage={background}
                primaryAction={isAuthenticated ? null : t('membership.loginToJoin')}
                onPrimaryActionClick={() => window.location.href = '/login'}
            />

            <div className="container container-padding py-16">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl font-bold mb-4">{t('membership.chooseMembershipTier')}</h2>
                    <p className="text-muted-foreground">
                        {t('membership.membershipSubtitle')}
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {tiers.map((tier) => (
                            <Card
                                key={tier.id}
                                className={`relative flex flex-col hover:shadow-xl transition-shadow duration-300 ${tier.is_featured ? 'border-primary shadow-md scale-105' : ''}`}
                            >
                                {tier.is_featured && (
                                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                                        {t('membership.popular')}
                                    </div>
                                )}
                                <CardHeader>
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                                        {getIcon(tier.icon)}
                                    </div>
                                    <CardTitle className="text-2xl">{tier.name}</CardTitle>
                                    <div className="mt-2">
                                        <span className="text-3xl font-bold">{tier.price}</span>
                                        <span className="text-muted-foreground ml-1">{t('membership.etbPerMonth')}</span>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <p className="text-muted-foreground mb-6">{tier.description}</p>
                                    <ul className="space-y-3">
                                        {tier.benefits && tier.benefits.map((benefit, idx) => (
                                            <li key={idx} className="flex items-start gap-2">
                                                <FiCheck className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                                <span className="text-sm">{benefit}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                                <CardFooter>
                                    {currentMembership && currentMembership.tier === tier.id && currentMembership.status === 'active' ? (
                                        <Button className="w-full" variant="outline" disabled>
                                            {t('membership.currentPlan')}
                                        </Button>
                                    ) : (
                                        <Button
                                            className="w-full"
                                            variant={tier.is_featured ? 'primary' : 'outline'}
                                            onClick={() => handleJoinClick(tier)}
                                            isLoading={processingTierId === tier.id}
                                        >
                                            {t('membership.joinNow')}
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <Modal
                open={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                title={t('membership.completeSubscription')}
                size="md"
            >
                <div className="space-y-6">
                    {selectedTier && (
                        <div className="bg-muted/30 p-4 rounded-lg border border-border">
                            <h3 className="font-semibold text-lg">{selectedTier.name}</h3>
                            <p className="text-2xl font-bold text-primary">{selectedTier.price} ETB <span className="text-sm font-normal text-muted-foreground">/ month</span></p>
                        </div>
                    )}

                    <PaymentMethodSelector
                        selectedMethod={paymentMethod}
                        onMethodChange={(method) => {
                            setPaymentMethod(method);
                            if (method !== 'manual_qr') setProofFile(null);
                        }}
                        onFileChange={setProofFile}
                        amount={parseFloat(selectedTier?.price || 0)}
                    />

                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                        <Button
                            variant="ghost"
                            onClick={() => setIsPaymentModalOpen(false)}
                            disabled={!!processingTierId}
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button
                            onClick={handleSubscribe}
                            disabled={!!processingTierId}
                            isLoading={!!processingTierId}
                        >
                            {t('common.confirm')}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Membership;
