import { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSave, FiGlobe, FiMail, FiShield, FiBell, FiUser, FiSettings, FiCreditCard } from 'react-icons/fi';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { AdminModuleHeader } from '@/components/admin/AdminModuleHeader';
import siteService from '@/services/siteService';

const Settings = memo(() => {
    const { t } = useTranslation();
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState({
        // General Settings
        siteName: 'Teqwa Mosque',
        siteDescription: 'Community Mosque Management System',
        siteUrl: window.location.origin,

        // Email Settings
        emailBackend: 'console',
        emailHost: 'smtp.gmail.com',
        emailPort: 587,
        emailUseTLS: true,
        emailUser: '',
        emailFrom: 'noreply@teqwa.org',

        // System Settings
        timezone: 'UTC',
        language: 'en',
        dateFormat: 'YYYY-MM-DD',
        timeFormat: '24h',

        // Security Settings
        sessionTimeout: 30,
        passwordMinLength: 8,
        requireEmailVerification: false,
        allowRegistration: true,

        // Notification Settings
        enableEmailNotifications: true,
        enableSMSNotifications: false,
        notifyOnNewUser: true,
        notifyOnNewDonation: true,

        // Jumuah Settings
        jumuahKhatibName: '',
        jumuahKhatibTitle: '',
        jumuahKhatibPhoto: '',

        // Daily Imam Settings
        dailyImamFajr: '',
        dailyImamDhuhr: '',
        dailyImamAsr: '',
        dailyImamMaghrib: '',
        dailyImamIsha: '',

        // Payment Settings (Backend Synced)
        cbeAccountNumber: '',
        cbeAccountName: '',
        telebirrAccountNumber: '',
        telebirrAccountName: '',

        // Ramadan Imams (Backend Synced)
        ramadanImamFajr: '',
        ramadanImamDhuhr: '',
        ramadanImamAsr: '',
        ramadanImamMaghrib: '',
        ramadanImamIsha: '',

        // Taraweeh Imams (Backend Synced)
        taraweehImams: '',
    });

    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            try {
                // Fetch local storage settings
                const storedKhatib = localStorage.getItem('jumuah_khatib');
                if (storedKhatib) {
                    const khatib = JSON.parse(storedKhatib);
                    setSettings(prev => ({
                        ...prev,
                        jumuahKhatibName: khatib.name || '',
                        jumuahKhatibTitle: khatib.title || '',
                        jumuahKhatibPhoto: khatib.photo || ''
                    }));
                }

                const storedImams = localStorage.getItem('daily_imams');
                if (storedImams) {
                    const imams = JSON.parse(storedImams);
                    setSettings(prev => ({
                        ...prev,
                        dailyImamFajr: imams.fajr || '',
                        dailyImamDhuhr: imams.dhuhr || '',
                        dailyImamAsr: imams.asr || '',
                        dailyImamMaghrib: imams.maghrib || '',
                        dailyImamIsha: imams.isha || ''
                    }));
                }

                // Fetch backend settings
                try {
                    const siteConfig = await siteService.getSiteConfig();
                    if (siteConfig && siteConfig.data) {
                        const data = siteConfig.data;
                        setSettings(prev => ({
                            ...prev,
                            cbeAccountNumber: data.cbe_account_number || '',
                            cbeAccountName: data.cbe_account_name || '',
                            telebirrAccountNumber: data.telebirr_account_number || '',
                            telebirrAccountName: data.telebirr_account_name || '',
                            ramadanImamFajr: data.ramadan_imams?.fajr?.join(', ') || '',
                            ramadanImamDhuhr: data.ramadan_imams?.dhuhr?.join(', ') || '',
                            ramadanImamAsr: data.ramadan_imams?.asr?.join(', ') || '',
                            ramadanImamMaghrib: data.ramadan_imams?.maghrib?.join(', ') || '',
                            ramadanImamIsha: data.ramadan_imams?.isha?.join(', ') || '',
                            taraweehImams: data.taraweeh_imams?.join(', ') || '',
                        }));
                    }
                } catch (apiErr) {
                    console.error('Failed to fetch site config:', apiErr);
                }
            } catch (e) {
                console.error('Error loading settings:', e);
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            // Save local storage settings
            if (settings.jumuahKhatibName) {
                const khatibInfo = {
                    name: settings.jumuahKhatibName,
                    title: settings.jumuahKhatibTitle || '',
                    photo: settings.jumuahKhatibPhoto || ''
                };
                localStorage.setItem('jumuah_khatib', JSON.stringify(khatibInfo));
            } else {
                localStorage.removeItem('jumuah_khatib');
            }

            const imams = {
                fajr: settings.dailyImamFajr || '',
                dhuhr: settings.dailyImamDhuhr || '',
                asr: settings.dailyImamAsr || '',
                maghrib: settings.dailyImamMaghrib || '',
                isha: settings.dailyImamIsha || ''
            };
            const hasImams = Object.values(imams).some(v => v.trim() !== '');
            if (hasImams) {
                localStorage.setItem('daily_imams', JSON.stringify(imams));
            } else {
                localStorage.removeItem('daily_imams');
            }

            // Save backend settings
            try {
                await siteService.updateSiteConfig({
                    cbe_account_number: settings.cbeAccountNumber,
                    cbe_account_name: settings.cbeAccountName,
                    telebirr_account_number: settings.telebirrAccountNumber,
                    telebirr_account_name: settings.telebirrAccountName,
                    ramadan_imams: {
                        fajr: settings.ramadanImamFajr.split(',').map(s => s.trim()).filter(Boolean),
                        dhuhr: settings.ramadanImamDhuhr.split(',').map(s => s.trim()).filter(Boolean),
                        asr: settings.ramadanImamAsr.split(',').map(s => s.trim()).filter(Boolean),
                        maghrib: settings.ramadanImamMaghrib.split(',').map(s => s.trim()).filter(Boolean),
                        isha: settings.ramadanImamIsha.split(',').map(s => s.trim()).filter(Boolean),
                    },
                    taraweeh_imams: settings.taraweehImams.split(',').map(s => s.trim()).filter(Boolean),
                });
            } catch (apiErr) {
                console.error('Failed to update site config:', apiErr);
                throw apiErr;
            }

            toast.success(t('settings.settingsSaved') || 'Settings saved successfully');
            window.dispatchEvent(new CustomEvent('custom:data-change', { detail: { type: 'settings:updated' } }));
            window.dispatchEvent(new CustomEvent('jumuah-khatib-updated'));
            window.dispatchEvent(new CustomEvent('daily-imams-updated'));
            window.dispatchEvent(new CustomEvent('site-config-updated'));
        } catch (error) {
            console.error('Failed to save settings:', error);
            toast.error(t('settings.failedToSave') || 'Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const sections = [
        {
            id: 'general',
            title: t('settings.generalSettings'),
            icon: FiGlobe,
            color: 'text-blue-500 bg-blue-50',
            fields: [
                { key: 'siteName', label: t('settings.siteName'), type: 'text' },
                { key: 'siteDescription', label: t('settings.siteDescription'), type: 'textarea' },
                { key: 'siteUrl', label: t('settings.siteUrl'), type: 'url' },
                { key: 'timezone', label: t('settings.timezone'), type: 'text' },
                {
                    key: 'language', label: t('settings.language'), type: 'select', options: [
                        { v: 'en', l: 'English' },
                        { v: 'am', l: 'አማርኛ (Amharic)' },
                        { v: 'ar', l: 'العربية (Arabic)' }
                    ]
                },
                { key: 'dateFormat', label: t('settings.dateFormat'), type: 'text' },
                {
                    key: 'timeFormat', label: t('settings.timeFormat'), type: 'select', options: [
                        { v: '12h', l: '12-hour' },
                        { v: '24h', l: '24-hour' }
                    ]
                },
            ]
        },
        {
            id: 'email',
            title: t('settings.emailSettings'),
            icon: FiMail,
            color: 'text-emerald-500 bg-emerald-50',
            fields: [
                {
                    key: 'emailBackend', label: t('settings.emailBackend'), type: 'select', options: [
                        { v: 'console', l: 'Console (Dev)' },
                        { v: 'smtp', l: 'SMTP' }
                    ]
                },
                { key: 'emailHost', label: t('settings.emailHost'), type: 'text' },
                { key: 'emailPort', label: t('settings.emailPort'), type: 'number' },
                { key: 'emailUseTLS', label: t('settings.emailUseTLS'), type: 'checkbox' },
                { key: 'emailUser', label: t('settings.emailUser'), type: 'text' },
                { key: 'emailFrom', label: t('settings.emailFrom'), type: 'email' },
            ]
        },
        {
            id: 'security',
            title: t('settings.securitySettings'),
            icon: FiShield,
            color: 'text-red-500 bg-red-50',
            fields: [
                { key: 'sessionTimeout', label: t('settings.sessionTimeout'), type: 'number' },
                { key: 'passwordMinLength', label: t('settings.passwordMinLength'), type: 'number' },
                { key: 'requireEmailVerification', label: t('settings.requireEmailVerification'), type: 'checkbox' },
                { key: 'allowRegistration', label: t('settings.allowRegistration'), type: 'checkbox' },
            ]
        },
        {
            id: 'notifications',
            title: t('settings.notificationSettings'),
            icon: FiBell,
            color: 'text-purple-500 bg-purple-50',
            fields: [
                { key: 'enableEmailNotifications', label: t('settings.enableEmailNotifications'), type: 'checkbox' },
                { key: 'enableSMSNotifications', label: t('settings.enableSMSNotifications'), type: 'checkbox' },
                { key: 'notifyOnNewUser', label: t('settings.notifyOnNewUser'), type: 'checkbox' },
                { key: 'notifyOnNewDonation', label: t('settings.notifyOnNewDonation'), type: 'checkbox' },
            ]
        },
        {
            id: 'jumuah',
            title: t('settings.jumuahSettings'),
            icon: FiUser,
            color: 'text-teal-500 bg-teal-50',
            fields: [
                { key: 'jumuahKhatibName', label: t('settings.jumuahKhatibName'), type: 'text' },
                { key: 'jumuahKhatibTitle', label: t('settings.jumuahKhatibTitle'), type: 'text' },
                { key: 'jumuahKhatibPhoto', label: t('settings.jumuahKhatibPhoto'), type: 'url' },
            ]
        },
        {
            id: 'dailyImam',
            title: t('settings.dailyImamSettings'),
            icon: FiUser,
            color: 'text-indigo-500 bg-indigo-50',
            fields: [
                { key: 'dailyImamFajr', label: t('settings.dailyImamFajr'), type: 'text' },
                { key: 'dailyImamDhuhr', label: t('settings.dailyImamDhuhr'), type: 'text' },
                { key: 'dailyImamAsr', label: t('settings.dailyImamAsr'), type: 'text' },
                { key: 'dailyImamMaghrib', label: t('settings.dailyImamMaghrib'), type: 'text' },
                { key: 'dailyImamIsha', label: t('settings.dailyImamIsha'), type: 'text' },
            ]
        },
        {
            id: 'payment',
            title: t('settings.paymentSettings'),
            icon: FiCreditCard,
            color: 'text-amber-500 bg-amber-50',
            fields: [
                { key: 'cbeAccountNumber', label: t('settings.cbeAccountNumber'), type: 'text' },
                { key: 'cbeAccountName', label: t('settings.cbeAccountName'), type: 'text' },
                { key: 'telebirrAccountNumber', label: t('settings.telebirrAccountNumber'), type: 'text' },
                { key: 'telebirrAccountName', label: t('settings.telebirrAccountName'), type: 'text' },
            ]
        },
        {
            id: 'ramadanImam',
            title: 'Ramadan Daily Imams',
            icon: FiUser,
            color: 'text-orange-500 bg-orange-50',
            fields: [
                { key: 'ramadanImamFajr', label: 'Suhoor/Fajr Imams (comma separated)', type: 'text' },
                { key: 'ramadanImamDhuhr', label: 'Dhuhr Imams (comma separated)', type: 'text' },
                { key: 'ramadanImamAsr', label: 'Asr Imams (comma separated)', type: 'text' },
                { key: 'ramadanImamMaghrib', label: 'Iftar/Maghrib Imams (comma separated)', type: 'text' },
                { key: 'ramadanImamIsha', label: 'Isha Imams (comma separated)', type: 'text' },
            ]
        },
        {
            id: 'taraweehImam',
            title: 'Taraweeh Prayer Imams',
            icon: FiUser,
            color: 'text-purple-500 bg-purple-50',
            fields: [
                { key: 'taraweehImams', label: 'Imams (comma separated)', type: 'text' },
            ]
        }
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <AdminModuleHeader
                title={t('settings.systemSettings')}
                subtitle={t('settings.configureSubtitle') || "Adjust system-wide configurations, security, and mosque-specific parameters."}
            />

            <div className="flex justify-end mb-10">
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="h-16 px-10 rounded-3xl bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-500/20 text-lg font-black transition-all"
                >
                    <FiSave className={`mr-3 ${saving ? 'animate-spin' : ''}`} />
                    {saving ? t('settings.saving') : t('settings.saveAll')}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {sections.map((section, idx) => (
                    <motion.div
                        key={section.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <Card className="h-full border-white/20 bg-white/40 backdrop-blur-xl shadow-xl rounded-[2.5rem] overflow-hidden group">
                            <CardContent className="p-8">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className={`p-4 rounded-2xl ${section.color} shadow-sm group-hover:scale-110 transition-transform`}>
                                        <section.icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-800 tracking-tight">{section.title}</h3>
                                </div>

                                <div className="space-y-6">
                                    {section.fields.map(field => (
                                        <div key={field.key} className="space-y-2">
                                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">{field.label}</label>
                                            {field.type === 'textarea' ? (
                                                <textarea
                                                    value={settings[field.key]}
                                                    onChange={(e) => setSettings({ ...settings, [field.key]: e.target.value })}
                                                    className="w-full px-5 py-4 bg-white/60 border-2 border-transparent focus:border-emerald-500/30 focus:bg-white rounded-2xl transition-all outline-none font-bold text-gray-700 min-h-[100px]"
                                                />
                                            ) : field.type === 'select' ? (
                                                <select
                                                    value={settings[field.key]}
                                                    onChange={(e) => setSettings({ ...settings, [field.key]: e.target.value })}
                                                    className="w-full px-5 py-4 bg-white/60 border-2 border-transparent focus:border-emerald-500/30 focus:bg-white rounded-2xl transition-all outline-none font-bold text-gray-700 cursor-pointer"
                                                >
                                                    {field.options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                                                </select>
                                            ) : field.type === 'checkbox' ? (
                                                <div className="flex items-center gap-3 bg-white/60 p-4 rounded-2xl cursor-pointer hover:bg-white/80 transition-colors"
                                                    onClick={() => setSettings({ ...settings, [field.key]: !settings[field.key] })}>
                                                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${settings[field.key] ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'}`}>
                                                        {settings[field.key] && <div className="w-2 h-2 bg-white rounded-full" />}
                                                    </div>
                                                    <span className="font-bold text-gray-600">Enabled</span>
                                                </div>
                                            ) : (
                                                <input
                                                    type={field.type}
                                                    value={settings[field.key]}
                                                    onChange={(e) => setSettings({ ...settings, [field.key]: e.target.value })}
                                                    className="w-full px-5 py-4 bg-white/60 border-2 border-transparent focus:border-emerald-500/30 focus:bg-white rounded-2xl transition-all outline-none font-bold text-gray-700"
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    );
});

Settings.displayName = 'Settings';
export default Settings;
