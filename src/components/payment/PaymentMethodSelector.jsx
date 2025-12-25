import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCreditCard, FiSmartphone, FiUploadCloud, FiCheck, FiInfo, FiFileText, FiX } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/Card';

export const PaymentMethodSelector = ({
    selectedMethod,
    onMethodChange,
    onFileChange,
    amount,
    error
}) => {
    const { t } = useTranslation();
    const [previewUrl, setPreviewUrl] = useState(null);
    const [dragActive, setDragActive] = useState(false);

    // Clean up preview URL on unmount
    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    const handleFile = (file) => {
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                // You might want to bubble this error up differently
                alert(t('common.invalidFileType') || "Please upload an image file");
                return;
            }

            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            onFileChange(file);
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-3">
                <label className="text-base font-semibold text-foreground flex items-center gap-2">
                    <FiCreditCard className="w-5 h-5 text-primary" />
                    {t('payment.selectMethod') || "Select Payment Method"}
                </label>

                <div className="grid md:grid-cols-2 gap-4">
                    {/* Card / Chapa Option */}
                    <div
                        onClick={() => onMethodChange('card')}
                        className={`
              relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
              flex items-start gap-4 hover:border-primary/50 hover:bg-primary/5
              ${selectedMethod === 'card'
                                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                : 'border-border bg-background'
                            }
            `}
                    >
                        <div className={`
              mt-1 p-2 rounded-lg transition-colors
              ${selectedMethod === 'card' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
            `}>
                            <FiCreditCard className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <h4 className="font-semibold text-foreground">
                                    {t('payment.onlinePayment') || "Online Payment"}
                                </h4>
                                {selectedMethod === 'card' && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="bg-primary text-primary-foreground rounded-full p-0.5"
                                    >
                                        <FiCheck className="w-3 h-3" />
                                    </motion.div>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                                {t('payment.payWithChapa') || "Pay securely with Chapa (Telebirr, CBE, Cards)"}
                            </p>
                        </div>
                    </div>

                    {/* Manual / QR Option */}
                    <div
                        onClick={() => onMethodChange('manual_qr')}
                        className={`
              relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
              flex items-start gap-4 hover:border-primary/50 hover:bg-primary/5
              ${selectedMethod === 'manual_qr'
                                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                : 'border-border bg-background'
                            }
            `}
                    >
                        <div className={`
              mt-1 p-2 rounded-lg transition-colors
              ${selectedMethod === 'manual_qr' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
            `}>
                            <FiSmartphone className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <h4 className="font-semibold text-foreground">
                                    {t('payment.manualTransfer') || "Manual Transfer / QR"}
                                </h4>
                                {selectedMethod === 'manual_qr' && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="bg-primary text-primary-foreground rounded-full p-0.5"
                                    >
                                        <FiCheck className="w-3 h-3" />
                                    </motion.div>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                                {t('payment.scanQrDesc') || "Scan QR code or transfer to bank account"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Manual Payment Details */}
            <AnimatePresence>
                {selectedMethod === 'manual_qr' && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <Card className="bg-muted/30 border-dashed border-2 border-border p-6 space-y-6">
                            {/* Bank Details */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                                        <FiInfo className="w-4 h-4 text-primary" />
                                        {t('payment.bankDetails') || "Bank Details"}
                                    </h4>
                                    <div className="space-y-3 text-sm">
                                        <div className="bg-background p-3 rounded-lg border border-border">
                                            <span className="block text-xs text-muted-foreground uppercase">{t('payment.bankName') || "Commercial Bank of Ethiopia"}</span>
                                            <span className="font-mono font-medium">1000123456789</span>
                                            <span className="block text-xs text-primary mt-1">Mujemaa Teqwa</span>
                                        </div>
                                        <div className="bg-background p-3 rounded-lg border border-border">
                                            <span className="block text-xs text-muted-foreground uppercase">{t('payment.telebirr') || "Telebirr"}</span>
                                            <span className="font-mono font-medium">0911223344</span>
                                            <span className="block text-xs text-primary mt-1">Mujemaa Teqwa</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center justify-center space-y-2">
                                    <div className="w-32 h-32 bg-white p-2 rounded-lg shadow-sm">
                                        {/* Placeholder for QR Code */}
                                        <div className="w-full h-full border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-gray-400 text-xs text-center">
                                            QR Code
                                        </div>
                                    </div>
                                    <span className="text-xs text-muted-foreground">{t('payment.scanToPay') || "Scan to Pay"}</span>
                                </div>
                            </div>

                            {/* File Upload */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">
                                    {t('payment.uploadProof') || "Upload Payment Proof (Screenshot/Receipt)"}
                                </label>

                                <div
                                    className={`
                    relative border-2 border-dashed rounded-xl p-6 transition-all duration-200 text-center
                    ${dragActive
                                            ? 'border-primary bg-primary/10 scale-[1.02]'
                                            : previewUrl
                                                ? 'border-primary/50 bg-background'
                                                : 'border-border hover:border-primary/50 hover:bg-muted/50'
                                        }
                  `}
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                >
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleFile(e.target.files[0])}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />

                                    {previewUrl ? (
                                        <div className="relative">
                                            <img
                                                src={previewUrl}
                                                alt="Preview"
                                                className="max-h-48 mx-auto rounded-lg shadow-sm"
                                            />
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setPreviewUrl(null);
                                                    onFileChange(null);
                                                }}
                                                className="absolute -top-2 -right-2 bg-destructive text-white p-1 rounded-full shadow-md hover:bg-destructive/90 transition-colors"
                                            >
                                                <FiX className="w-4 h-4" />
                                            </button>
                                            <div className="mt-2 text-sm text-primary font-medium flex items-center justify-center gap-2">
                                                <FiCheck className="w-4 h-4" />
                                                {t('common.fileSelected') || "File Ready to Upload"}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2 pointer-events-none">
                                            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                                <FiUploadCloud className="w-6 h-6" />
                                            </div>
                                            <div className="text-sm">
                                                <span className="font-semibold text-primary">{t('common.clickToUpload') || "Click to upload"}</span>
                                                <span className="text-muted-foreground"> {t('common.orDragAndDrop') || "or drag and drop"}</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 5MB</p>
                                        </div>
                                    )}
                                </div>
                                {error && (
                                    <p className="text-sm text-destructive flex items-center gap-1 mt-1">
                                        <FiInfo className="w-4 h-4" />
                                        {error}
                                    </p>
                                )}
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
