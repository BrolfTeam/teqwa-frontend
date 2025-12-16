import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSettings, FiSave, FiRefreshCw, FiDatabase, FiMail, FiGlobe, FiShield, FiBell, FiUser } from 'react-icons/fi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui';

export default function Settings() {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
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
    });

    // Load settings on mount
    useEffect(() => {
        try {
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
            
            // Load daily imams
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
        } catch (e) {
            console.error('Error loading settings:', e);
        }
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            // Save Jumuah khatib info to localStorage
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
            
            // Save daily imams to localStorage
            const imams = {
                fajr: settings.dailyImamFajr || '',
                dhuhr: settings.dailyImamDhuhr || '',
                asr: settings.dailyImamAsr || '',
                maghrib: settings.dailyImamMaghrib || '',
                isha: settings.dailyImamIsha || ''
            };
            // Only save if at least one imam is set
            const hasImams = Object.values(imams).some(v => v.trim() !== '');
            if (hasImams) {
                localStorage.setItem('daily_imams', JSON.stringify(imams));
            } else {
                localStorage.removeItem('daily_imams');
            }
            
            // Save settings to backend
            // await apiService.put('/admin/settings/', settings);
            toast.success('Settings saved successfully');
            // Dispatch event to refresh dashboard and homepage
            window.dispatchEvent(new CustomEvent('custom:data-change', { detail: { type: 'settings:updated' } }));
            window.dispatchEvent(new CustomEvent('jumuah-khatib-updated'));
            window.dispatchEvent(new CustomEvent('daily-imams-updated'));
        } catch (error) {
            console.error('Failed to save settings:', error);
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold mb-2">System Settings</h1>
                    <p className="text-muted-foreground">Configure system-wide settings</p>
                </div>
                <Button onClick={handleSave} disabled={saving}>
                    <FiSave className="mr-2" />
                    {saving ? 'Saving...' : 'Save All Settings'}
                </Button>
            </div>

            <div className="grid gap-6">
                {/* General Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FiGlobe className="text-blue-500" />
                            General Settings
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Site Name</label>
                            <input
                                type="text"
                                value={settings.siteName}
                                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg bg-background"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Site Description</label>
                            <textarea
                                value={settings.siteDescription}
                                onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg bg-background"
                                rows="3"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Site URL</label>
                            <input
                                type="url"
                                value={settings.siteUrl}
                                onChange={(e) => setSettings({ ...settings, siteUrl: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg bg-background"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Email Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FiMail className="text-green-500" />
                            Email Settings
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Email Backend</label>
                            <select
                                value={settings.emailBackend}
                                onChange={(e) => setSettings({ ...settings, emailBackend: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg bg-background"
                            >
                                <option value="console">Console (Development)</option>
                                <option value="smtp">SMTP</option>
                            </select>
                        </div>
                        {settings.emailBackend === 'smtp' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium mb-1">SMTP Host</label>
                                    <input
                                        type="text"
                                        value={settings.emailHost}
                                        onChange={(e) => setSettings({ ...settings, emailHost: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg bg-background"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">SMTP Port</label>
                                    <input
                                        type="number"
                                        value={settings.emailPort}
                                        onChange={(e) => setSettings({ ...settings, emailPort: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 border rounded-lg bg-background"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Email User</label>
                                    <input
                                        type="email"
                                        value={settings.emailUser}
                                        onChange={(e) => setSettings({ ...settings, emailUser: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg bg-background"
                                    />
                                </div>
                            </>
                        )}
                        <div>
                            <label className="block text-sm font-medium mb-1">From Email</label>
                            <input
                                type="email"
                                value={settings.emailFrom}
                                onChange={(e) => setSettings({ ...settings, emailFrom: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg bg-background"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Security Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FiShield className="text-red-500" />
                            Security Settings
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Session Timeout (minutes)</label>
                            <input
                                type="number"
                                value={settings.sessionTimeout}
                                onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
                                className="w-full px-3 py-2 border rounded-lg bg-background"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Minimum Password Length</label>
                            <input
                                type="number"
                                value={settings.passwordMinLength}
                                onChange={(e) => setSettings({ ...settings, passwordMinLength: parseInt(e.target.value) })}
                                className="w-full px-3 py-2 border rounded-lg bg-background"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="requireEmailVerification"
                                checked={settings.requireEmailVerification}
                                onChange={(e) => setSettings({ ...settings, requireEmailVerification: e.target.checked })}
                                className="w-4 h-4"
                            />
                            <label htmlFor="requireEmailVerification" className="text-sm font-medium">
                                Require Email Verification
                            </label>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="allowRegistration"
                                checked={settings.allowRegistration}
                                onChange={(e) => setSettings({ ...settings, allowRegistration: e.target.checked })}
                                className="w-4 h-4"
                            />
                            <label htmlFor="allowRegistration" className="text-sm font-medium">
                                Allow User Registration
                            </label>
                        </div>
                    </CardContent>
                </Card>

                {/* Notification Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FiBell className="text-purple-500" />
                            Notification Settings
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="enableEmailNotifications"
                                checked={settings.enableEmailNotifications}
                                onChange={(e) => setSettings({ ...settings, enableEmailNotifications: e.target.checked })}
                                className="w-4 h-4"
                            />
                            <label htmlFor="enableEmailNotifications" className="text-sm font-medium">
                                Enable Email Notifications
                            </label>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="notifyOnNewUser"
                                checked={settings.notifyOnNewUser}
                                onChange={(e) => setSettings({ ...settings, notifyOnNewUser: e.target.checked })}
                                className="w-4 h-4"
                            />
                            <label htmlFor="notifyOnNewUser" className="text-sm font-medium">
                                Notify on New User Registration
                            </label>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="notifyOnNewDonation"
                                checked={settings.notifyOnNewDonation}
                                onChange={(e) => setSettings({ ...settings, notifyOnNewDonation: e.target.checked })}
                                className="w-4 h-4"
                            />
                            <label htmlFor="notifyOnNewDonation" className="text-sm font-medium">
                                Notify on New Donation
                            </label>
                        </div>
                    </CardContent>
                </Card>

                {/* Jumuah Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FiUser className="text-teal-500" />
                            Jumu'ah Settings
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Khatib/Imam Name *</label>
                            <input
                                type="text"
                                value={settings.jumuahKhatibName}
                                onChange={(e) => setSettings({ ...settings, jumuahKhatibName: e.target.value })}
                                placeholder="e.g., Sheikh Ahmad Ali"
                                className="w-full px-3 py-2 border rounded-lg bg-background"
                            />
                            <p className="text-xs text-muted-foreground mt-1">This will be displayed on the homepage during Jumu'ah</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Khatib/Imam Title (Optional)</label>
                            <input
                                type="text"
                                value={settings.jumuahKhatibTitle}
                                onChange={(e) => setSettings({ ...settings, jumuahKhatibTitle: e.target.value })}
                                placeholder="e.g., Resident Imam, Guest Speaker"
                                className="w-full px-3 py-2 border rounded-lg bg-background"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Profile Photo URL (Optional)</label>
                            <input
                                type="url"
                                value={settings.jumuahKhatibPhoto}
                                onChange={(e) => setSettings({ ...settings, jumuahKhatibPhoto: e.target.value })}
                                placeholder="https://example.com/photo.jpg or data:image/..."
                                className="w-full px-3 py-2 border rounded-lg bg-background"
                            />
                            <p className="text-xs text-muted-foreground mt-1">Enter image URL or base64 data URI. Leave empty to use default icon.</p>
                            {settings.jumuahKhatibPhoto && (
                                <div className="mt-2">
                                    <img 
                                        src={settings.jumuahKhatibPhoto} 
                                        alt="Khatib preview" 
                                        className="w-20 h-20 rounded-full object-cover border-2 border-teal-500"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Daily Imam Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FiUser className="text-blue-500" />
                            Daily Prayer Imam Settings
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground mb-4">
                            Assign imams for each daily prayer. These will be displayed in the prayer times widget on the homepage.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Fajr Imam</label>
                                <input
                                    type="text"
                                    value={settings.dailyImamFajr}
                                    onChange={(e) => setSettings({ ...settings, dailyImamFajr: e.target.value })}
                                    placeholder="e.g., Sheikh Ahmad"
                                    className="w-full px-3 py-2 border rounded-lg bg-background"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Dhuhr Imam</label>
                                <input
                                    type="text"
                                    value={settings.dailyImamDhuhr}
                                    onChange={(e) => setSettings({ ...settings, dailyImamDhuhr: e.target.value })}
                                    placeholder="e.g., Sheikh Ahmad"
                                    className="w-full px-3 py-2 border rounded-lg bg-background"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Asr Imam</label>
                                <input
                                    type="text"
                                    value={settings.dailyImamAsr}
                                    onChange={(e) => setSettings({ ...settings, dailyImamAsr: e.target.value })}
                                    placeholder="e.g., Sheikh Ahmad"
                                    className="w-full px-3 py-2 border rounded-lg bg-background"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Maghrib Imam</label>
                                <input
                                    type="text"
                                    value={settings.dailyImamMaghrib}
                                    onChange={(e) => setSettings({ ...settings, dailyImamMaghrib: e.target.value })}
                                    placeholder="e.g., Sheikh Ahmad"
                                    className="w-full px-3 py-2 border rounded-lg bg-background"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Isha Imam</label>
                                <input
                                    type="text"
                                    value={settings.dailyImamIsha}
                                    onChange={(e) => setSettings({ ...settings, dailyImamIsha: e.target.value })}
                                    placeholder="e.g., Sheikh Ahmad"
                                    className="w-full px-3 py-2 border rounded-lg bg-background"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

