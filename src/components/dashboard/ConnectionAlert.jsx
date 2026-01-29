import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCloudOff, FiRefreshCw } from 'react-icons/fi';
import { dataService } from '@/lib/dataService';
import { useTranslation } from 'react-i18next';

export const ConnectionAlert = () => {
    const { t } = useTranslation();
    const [isConnected, setIsConnected] = useState(dataService.isConnected);

    useEffect(() => {
        return dataService.subscribe(setIsConnected);
    }, []);

    return (
        <AnimatePresence>
            {!isConnected && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                >
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mb-6 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                                <FiCloudOff className="w-4 h-4 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-amber-800 dark:text-amber-400">
                                    {t('common.connectionError') || 'Connection unstable'}
                                </p>
                                <p className="text-xs text-amber-700/70 dark:text-amber-500/70 leading-tight">
                                    {t('common.offlineNotice') || 'Some content may not be up to date. We\'ll keep trying to connect.'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="flex items-center gap-1 text-xs font-bold text-amber-700 dark:text-amber-500 hover:text-amber-900 dark:hover:text-amber-300 transition-colors uppercase tracking-wider"
                        >
                            <FiRefreshCw className="w-3 h-3" />
                            {t('common.retry') || 'Retry'}
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
