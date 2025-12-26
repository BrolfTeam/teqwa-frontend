import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FiUser, FiMail, FiPhone, FiEdit, FiSave, FiX, FiInfo } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export const ProfileInfo = ({
    formData,
    isEditing,
    isSaving,
    handleChange,
    handleSave,
    handleCancel,
    setIsEditing
}) => {
    const { t } = useTranslation();

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
        >
            <Card className="shadow-2xl border-white/20 bg-white/40 backdrop-blur-xl overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-b border-white/20 p-6">
                    <CardTitle className="flex items-center space-x-3 text-xl font-bold text-gray-800">
                        <div className="p-2 bg-emerald-500 rounded-lg shadow-lg shadow-emerald-500/20">
                            <FiUser className="h-5 w-5 text-white" />
                        </div>
                        <span>{t('profile.personalInfo')}</span>
                    </CardTitle>

                    {!isEditing ? (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsEditing(true)}
                            className="rounded-full px-6 border-emerald-500/30 hover:bg-emerald-500 hover:text-white transition-all duration-300"
                        >
                            <FiEdit className="h-4 w-4 mr-2" />
                            {t('profile.edit')}
                        </Button>
                    ) : (
                        <div className="flex space-x-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleCancel}
                                disabled={isSaving}
                                className="rounded-full px-4 hover:bg-gray-100"
                            >
                                <FiX className="h-4 w-4 mr-2" />
                                {t('profile.cancel')}
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleSave}
                                disabled={isSaving}
                                className="rounded-full px-6 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all"
                            >
                                {isSaving ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                ) : (
                                    <FiSave className="h-4 w-4 mr-2" />
                                )}
                                {t('profile.save')}
                            </Button>
                        </div>
                    )}
                </CardHeader>

                <CardContent className="p-8 space-y-8">
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Full Name */}
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-wider text-emerald-700/60 ml-1">
                                {t('profile.fullName')}
                            </label>
                            {isEditing ? (
                                <div className="relative">
                                    <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" />
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-3.5 bg-white border border-emerald-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium"
                                        placeholder={t('profile.fullName')}
                                    />
                                </div>
                            ) : (
                                <div className="flex items-center space-x-3 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50">
                                    <FiUser className="h-5 w-5 text-emerald-600" />
                                    <span className="font-semibold text-gray-800">{formData.name || t('profile.notProvided')}</span>
                                </div>
                            )}
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-wider text-emerald-700/60 ml-1">
                                {t('profile.email')}
                            </label>
                            <div className="relative">
                                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 text-gray-400">
                                    <FiMail className="h-5 w-5" />
                                    <span className="font-medium">{formData.email || t('profile.notProvided')}</span>
                                </div>
                                {isEditing && (
                                    <div className="mt-2 flex items-center text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                                        <FiInfo className="mr-1" />
                                        {t('profile.emailNotice')}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-wider text-emerald-700/60 ml-1">
                                {t('profile.phone')}
                            </label>
                            {isEditing ? (
                                <div className="relative">
                                    <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" />
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-3.5 bg-white border border-emerald-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium"
                                        placeholder={t('profile.phone')}
                                    />
                                </div>
                            ) : (
                                <div className="flex items-center space-x-3 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50">
                                    <FiPhone className="h-5 w-5 text-emerald-600" />
                                    <span className="font-semibold text-gray-800">{formData.phone || t('profile.notProvided')}</span>
                                </div>
                            )}
                        </div>

                        {/* Empty column for alignment or future fields */}
                        <div className="hidden md:block" />
                    </div>

                    {/* Bio */}
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-wider text-emerald-700/60 ml-1">
                            {t('profile.bio')}
                        </label>
                        {isEditing ? (
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                rows={4}
                                className="w-full px-5 py-4 bg-white border border-emerald-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium resize-none"
                                placeholder={t('profile.bioPlaceholder')}
                            />
                        ) : (
                            <div className="p-6 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 min-h-[140px] relative overflow-hidden">
                                <p className="text-gray-700 font-medium leading-relaxed italic relative z-10">
                                    {formData.bio || t('profile.noBio')}
                                </p>
                                <FiInfo className="absolute bottom-4 right-4 text-emerald-500/10 w-24 h-24 -rotate-12" />
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};
