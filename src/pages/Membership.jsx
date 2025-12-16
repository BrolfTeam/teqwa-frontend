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
import background from '@/assets/background.png';

const Membership = () => {
    const [tiers, setTiers] = useState([]);
    const [currentMembership, setCurrentMembership] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processingTierId, setProcessingTierId] = useState(null);
    const { isAuthenticated, user } = useAuth();

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
                toast.error('Failed to load membership options');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [isAuthenticated]);

    const handleJoin = async (tier) => {
        if (!isAuthenticated) {
            toast.error('Please login to join our membership program');
            return;
        }

        setProcessingTierId(tier.id);
        try {
            // 1. Create Membership Record
            const membershipResponse = await apiService.subscribeToMembership({
                tier: tier.id
            });

            // 2. Initialize Payment
            if (membershipResponse) {
                const paymentResponse = await paymentService.initializePayment({
                    amount: tier.price,
                    currency: 'ETB',
                    email: user.email,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    phone_number: user.phone || '0900000000',
                    content_type_model: 'usermembership',
                    object_id: membershipResponse.id || membershipResponse.data?.id
                });

                if (paymentResponse && paymentResponse.checkout_url) {
                    window.location.href = paymentResponse.checkout_url;
                }
            }
        } catch (error) {
            console.error('Join failed:', error);
            toast.error('Failed to process membership request');
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
                title="Membership"
                subtitle="Join our community and become a member of MuJemea At-Tekwa."
                backgroundImage={background}
                primaryAction={isAuthenticated ? null : "Login to Join"}
                onPrimaryActionClick={() => window.location.href = '/login'}
            />

            <div className="container container-padding py-16">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl font-bold mb-4">Choose Your Membership Tier</h2>
                    <p className="text-muted-foreground">
                        Support our mosque and gain access to exclusive community benefits.
                        Select the plan that best fits your commitment to our cause.
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
                                        POPULAR
                                    </div>
                                )}
                                <CardHeader>
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                                        {getIcon(tier.icon)}
                                    </div>
                                    <CardTitle className="text-2xl">{tier.name}</CardTitle>
                                    <div className="mt-2">
                                        <span className="text-3xl font-bold">{tier.price}</span>
                                        <span className="text-muted-foreground ml-1">ETB / month</span>
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
                                            Current Plan
                                        </Button>
                                    ) : (
                                        <Button
                                            className="w-full"
                                            variant={tier.is_featured ? 'primary' : 'outline'}
                                            onClick={() => handleJoin(tier)}
                                            isLoading={processingTierId === tier.id}
                                        >
                                            Join Now
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Membership;
