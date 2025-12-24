import { useState, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowUp } from 'react-icons/fi';
import useTranslation from '@/hooks/useTranslation';

const ScrollToTopFAB = memo(() => {
    const { t, translate, isRTL } = useTranslation();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility, { passive: true });
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = useCallback(() => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    }, []);

    return (
        <AnimatePresence>
            {isVisible && (
                <div className={`fixed bottom-24 ${isRTL() ? 'left-6' : 'right-6'} z-50 pointer-events-none md:pointer-events-auto`}>
                    <motion.button
                        initial={{ opacity: 0, scale: 0.5, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.5, y: 20 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={scrollToTop}
                        className="pointer-events-auto w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary text-white shadow-2xl flex items-center justify-center hover:bg-primary/90 transition-all duration-300 relative group overflow-hidden border border-white/20"
                        aria-label={translate('footer.backToTop', 'Back to Top')}
                        title={translate('footer.backToTop', 'Back to Top')}
                    >
                        <span className="absolute inset-0 bg-white/20 scale-0 group-hover:scale-150 rounded-full transition-transform duration-700" />
                        <FiArrowUp className="w-6 h-6 transition-transform duration-300 group-hover:-translate-y-1" />
                    </motion.button>
                </div>
            )}
        </AnimatePresence>
    );
});

ScrollToTopFAB.displayName = 'ScrollToTopFAB';
export default ScrollToTopFAB;
