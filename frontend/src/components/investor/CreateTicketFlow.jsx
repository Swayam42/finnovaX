import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import {
    UploadCloud, CheckCircle2, AlertCircle, Send, FileText,
    Clock, ChevronLeft, Check, ArrowRight, X, Sparkles, ShieldAlert,
    Eye, Image as ImageIcon, FileType
} from 'lucide-react';
import { SERVICE_TYPE_LIST, getServiceType } from '../../config/serviceTypes';
import { useAuth } from '../../context/AuthContext';
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

// ─── Animation Variants ───────────────────────────────────────────────────────
const stepVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit:    { opacity: 0, x: -20, transition: { duration: 0.2 } }
};
const backVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit:    { opacity: 0, x: 20, transition: { duration: 0.2 } }
};

const STEPS = [
    { num: 1, label: 'Select Service' },
    { num: 2, label: 'Fill Details'   },
    { num: 3, label: 'Review & Submit'}
];

// ─── Step Indicator ───────────────────────────────────────────────────────────
const StepIndicator = ({ current }) => {
    const progress = ((current - 1) / (STEPS.length - 1)) * 100;
    return (
        <div className="mb-10 max-w-xl mx-auto px-4">
            <div className="relative mb-6">
                <Progress value={progress} className="h-1 bg-zinc-100" />
            </div>
            <div className="flex justify-between relative -top-3">
                {STEPS.map(step => {
                    const done   = current > step.num;
                    const active = current === step.num;
                    return (
                        <div key={step.num} className="flex flex-col items-center gap-2">
                            <motion.div layout
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm border-2 bg-white transition-colors z-10 ${
                                    done   ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-900 dark:bg-zinc-100'
                                           : active ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100'
                                                    : 'border-zinc-200 dark:border-zinc-700 text-zinc-400 dark:text-zinc-600'
                                }`}
                            >
                                {done ? <Check className="w-4 h-4 text-white dark:text-zinc-900" /> : step.num}
                            </motion.div>
                            <span className={`text-xs font-medium text-center ${active || done ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400 dark:text-zinc-500'}`}>
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// ─── Service Card ─────────────────────────────────────────────────────────────
const ServiceCard = ({ config, isSelected, onClick }) => {
    const Icon = config.icon;
    return (
        <motion.div
            onClick={() => onClick(config.key)}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={`relative text-left w-full rounded-xl border p-4 cursor-pointer transition-all duration-200 flex flex-col gap-3 ${
                isSelected
                    ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-[#1A1A1A] shadow-sm ring-1 ring-zinc-900 dark:ring-zinc-100'
                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#131313] hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm'
            }`}
        >
            <AnimatePresence>
                {isSelected && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="absolute top-3 right-3 w-5 h-5 bg-zinc-900 dark:bg-zinc-100 rounded-full flex items-center justify-center"
                    >
                        <Check className="w-3 h-3 text-white dark:text-zinc-900" />
                    </motion.div>
                )}
            </AnimatePresence>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                isSelected ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400'
            }`}>
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <h3 className={`font-semibold text-sm mb-0.5 transition-colors ${isSelected ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-700 dark:text-zinc-300'}`}>
                    {config.label}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">{config.description}</p>
            </div>
            <div className="flex items-center gap-1.5 mt-auto pt-2">
                <Clock className="w-3 h-3 text-zinc-400" />
                <span className="text-[11px] font-medium text-zinc-500">SLA: {config.expectedSLA}</span>
            </div>
        </motion.div>
    );
};

// ─── Metadata Field ───────────────────────────────────────────────────────────
const MetadataField = ({ field, value, onChange }) => {
    if (field.type === 'select') {
        return (
            <Select value={value || ''} onValueChange={(val) => onChange({ target: { name: field.name, value: val } })}>
                <SelectTrigger className="w-full bg-white dark:bg-[#131313] border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100">
                    <SelectValue placeholder={`Select ${field.label}`} />
                </SelectTrigger>
                <SelectContent>
                    {field.options.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                </SelectContent>
            </Select>
        );
    }
    if (field.type === 'textarea') {
        return (
            <Textarea name={field.name} value={value || ''} onChange={onChange} placeholder={field.placeholder}
                required={field.required}
                className="bg-white dark:bg-[#131313] border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 min-h-[100px]"
            />
        );
    }
    return (
        <Input type={field.type === 'email' ? 'email' : field.type === 'number' ? 'number' : 'text'}
            name={field.name} value={value || ''} onChange={onChange} placeholder={field.placeholder}
            required={field.required}
            className="bg-white dark:bg-[#131313] border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
        />
    );
};

// ─── File Preview Thumbnail ───────────────────────────────────────────────────
const FilePreviewThumb = ({ file, name, isVault = false, url = null, onRemove, allowPreview = false }) => {
    const [previewUrl, setPreviewUrl] = useState(null);
    const isImage = file ? file.type?.startsWith('image/') : (url ? /\.(jpg|jpeg|png|gif|webp)$/i.test(url) : false);

    useEffect(() => {
        if (file && isImage) {
            const objUrl = URL.createObjectURL(file);
            setPreviewUrl(objUrl);
            return () => URL.revokeObjectURL(objUrl);
        }
        if (isVault && url) setPreviewUrl(url);
    }, [file, url, isImage, isVault]);

    const displayName = file ? file.name : (name || (isVault ? 'Vault Document' : 'Document'));
    const size = file ? `${(file.size / 1024).toFixed(1)} KB` : 'Verified';

    const handleFullscreen = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (previewUrl && isImage) {
            const img = new Image();
            img.src = previewUrl;
            img.style.width = '100vw';
            img.style.height = '100vh';
            img.style.objectFit = 'contain';
            img.style.background = 'rgba(0,0,0,0.9)';
            img.style.position = 'fixed';
            img.style.top = '0';
            img.style.left = '0';
            img.style.zIndex = '9999';
            img.onclick = () => document.body.removeChild(img);
            document.body.appendChild(img);
        }
    };

    const handleDownload = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (previewUrl) {
            const a = document.createElement('a');
            a.href = previewUrl;
            a.download = displayName;
            a.click();
        }
    };

    const ThumbContent = (
        <div className="relative group flex items-center gap-2.5 p-2.5 rounded-lg border transition-all cursor-default border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50">
            {/* Thumbnail */}
            <div className="w-9 h-9 rounded-md flex items-center justify-center shrink-0 overflow-hidden border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                {previewUrl && isImage ? (
                    <img src={previewUrl} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                    <FileType className="w-4 h-4 text-zinc-400" />
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate max-w-[130px] text-zinc-800 dark:text-zinc-200">
                    {displayName}
                </p>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5 flex items-center gap-1">
                    {isVault ? <><Check className="w-3 h-3 text-emerald-500" /> KYC Verified</> : size}
                </p>
            </div>

            {/* Remove */}
            {onRemove && (
                <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemove(); }}
                    className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all shrink-0">
                    <X className="w-3 h-3 text-zinc-500 dark:text-zinc-400" />
                </button>
            )}
        </div>
    );

    if (!allowPreview) return ThumbContent;

    return (
        <TooltipProvider delayDuration={200}>
            <Tooltip>
                <TooltipTrigger asChild>
                    {ThumbContent}
                </TooltipTrigger>
                {/* Hover Preview Popup */}
                {previewUrl && (
                    <TooltipContent side="right" className="p-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xl rounded-xl flex flex-col gap-3">
                        {isImage ? (
                            <img src={previewUrl} alt={displayName} className="w-48 h-48 object-contain rounded-lg border border-zinc-100 dark:border-zinc-900" />
                        ) : (
                            <div className="w-48 h-24 flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-100 dark:border-zinc-800">
                                <FileType className="w-8 h-8 text-zinc-400" />
                            </div>
                        )}
                        <div className="flex items-center justify-center gap-4">
                            <button onClick={handleFullscreen} className="flex items-center gap-1 text-[10px] font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                                <Eye className="w-3.5 h-3.5" /> View
                            </button>
                            <button onClick={handleDownload} className="flex items-center gap-1 text-[10px] font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg> Download
                            </button>
                        </div>
                    </TooltipContent>
                )}
            </Tooltip>
        </TooltipProvider>
    );
};

// ─── Review Row ───────────────────────────────────────────────────────────────
const ReviewRow = ({ label, value }) =>
    value ? (
        <div className="flex justify-between items-start py-3 border-b border-zinc-100 dark:border-zinc-800 last:border-0 gap-4">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 shrink-0">{label}</span>
            <span className="text-sm text-zinc-900 dark:text-zinc-100 font-medium text-right">{value}</span>
        </div>
    ) : null;

// ─── Main Component ───────────────────────────────────────────────────────────
const CreateTicketFlow = ({ onTabChange }) => {
    const [step, setStep] = useState(1);
    const [goingBack, setGoingBack] = useState(false);
    const [selectedType, setSelectedType] = useState(null);
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        investorName: user?.name || '',
        accountNumber: user?.bankAccount?.accountNumber || ''
    });
    const [serviceMetadata, setServiceMetadata] = useState({});
    const [files, setFiles] = useState([]);
    const [vaultDocs, setVaultDocs] = useState([]);
    const [status, setStatus] = useState({ type: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef(null);
    const formRef = useRef(null);

    const goTo = (nextStep) => {
        setGoingBack(nextStep < step);
        setStep(nextStep);
        setStatus({ type: '', message: '' });
    };

    const handleSelectType = (typeKey) => {
        setSelectedType(typeKey);
        setServiceMetadata({});
    };

    const handleContinueToForm = () => { if (selectedType) goTo(2); };
    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleMetadataChange = (e) => setServiceMetadata(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleGoToReview = (e) => { e.preventDefault(); goTo(3); };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setStatus({ type: '', message: '' });
        try {
            const serviceConfig = getServiceType(selectedType);
            const complaintText = selectedType === 'COMPLAINT'
                ? `[COMPLAINT] ${formData.title} - ${formData.description}`
                : `[${selectedType}] ${serviceConfig.label} request. ${formData.description || formData.title}`.trim();

            const payload = new FormData();
            payload.append('title', formData.title);
            payload.append('description', formData.description || complaintText);
            payload.append('complaintText', complaintText);
            payload.append('investorName', formData.investorName);
            payload.append('accountNumber', formData.accountNumber);
            payload.append('serviceType', selectedType);
            payload.append('serviceMetadata', JSON.stringify(serviceMetadata));
            files.forEach(f => payload.append('documents', f));
            if (vaultDocs.length > 0) payload.append('existingDocuments', JSON.stringify(vaultDocs));

            await apiClient.post('/tickets', payload, { headers: { 'Content-Type': 'multipart/form-data' } });

            toast.success(`${serviceConfig.label} request submitted`, {
                description: 'Your request has been securely logged.',
                action: {
                    label: 'Notifications',
                    onClick: () => { if (onTabChange) onTabChange('notifications'); }
                }
            });

            setSelectedType(null);
            setFormData({ title: '', description: '', investorName: user?.name || '', accountNumber: user?.bankAccount?.accountNumber || '' });
            setServiceMetadata({});
            setFiles([]);
            setVaultDocs([]);
            setTimeout(() => { if (onTabChange) onTabChange('tickets'); }, 1000);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit request.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const addVaultDoc = (name, url) => {
        setVaultDocs(prev => {
            if (prev.some(d => d.name === name)) return prev;
            return [...prev, { name, url }];
        });
    };

    const totalDocCount = files.length + vaultDocs.length;
    const currentConfig = selectedType ? getServiceType(selectedType) : null;
    const variants = goingBack ? backVariants : stepVariants;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <header className="text-center">
                <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">Create Service Request</h1>
                <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm">Select a category and provide details for your request.</p>
            </header>

            <StepIndicator current={step} />

            <AnimatePresence>
                {status.message && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`mb-6 p-4 rounded-xl border flex items-start gap-3 ${
                            status.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
                        }`}
                    >
                        {status.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                        <div className="flex-1">
                            <p className="font-semibold text-sm">{status.type === 'success' ? 'Success' : 'Error'}</p>
                            <p className="text-sm mt-0.5">{status.message}</p>
                        </div>
                        <button onClick={() => setStatus({ type: '', message: '' })} className="shrink-0 opacity-70 hover:opacity-100">
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence mode="wait" custom={goingBack}>
                {/* ── Step 1: Service Selection ── */}
                {step === 1 && (
                    <motion.div key="step1" variants={variants} initial="initial" animate="animate" exit="exit" className="space-y-8">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {SERVICE_TYPE_LIST.map(config => (
                                <ServiceCard key={config.key} config={config} isSelected={selectedType === config.key} onClick={handleSelectType} />
                            ))}
                        </div>
                        <div className="flex justify-end">
                            <Button onClick={handleContinueToForm} disabled={!selectedType} className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
                                Continue <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </div>
                    </motion.div>
                )}

                {/* ── Step 2: Fill Details ── */}
                {step === 2 && currentConfig && (
                    <motion.div key="step2" variants={variants} initial="initial" animate="animate" exit="exit" className="space-y-6">
                        <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-[#131313]">
                            <CardContent className="p-6 space-y-6">
                                <div className="flex items-center gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                                    <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 flex items-center justify-center">
                                        {React.createElement(currentConfig.icon, { className: "w-5 h-5" })}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{currentConfig.label}</p>
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1 mt-0.5">
                                            <Clock className="w-3 h-3" /> SLA: {currentConfig.expectedSLA}
                                        </p>
                                    </div>
                                </div>

                                <form ref={formRef} id="service-form" onSubmit={handleGoToReview} className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-zinc-900 dark:text-zinc-100">Investor Name</Label>
                                            <Input type="text" name="investorName" value={formData.investorName} readOnly className="bg-zinc-50 dark:bg-[#1A1A1A] text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-zinc-900 dark:text-zinc-100">Account Number <span className="text-red-500">*</span></Label>
                                            <Input type="text" pattern="[0-9]*" name="accountNumber" required value={formData.accountNumber}
                                                onChange={(e) => { const v = e.target.value; if (v === '' || /^[0-9\b]+$/.test(v)) handleChange(e); }}
                                                placeholder="Enter your account number"
                                                className="bg-white dark:bg-[#131313] border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-zinc-900 dark:text-zinc-100">Request Title <span className="text-red-500">*</span></Label>
                                        <Input type="text" name="title" required value={formData.title} onChange={handleChange}
                                            placeholder="Brief summary"
                                            className="bg-white dark:bg-[#131313] border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500" />
                                    </div>

                                    {currentConfig.requiredFields.length > 0 && (
                                        <div className="space-y-4 pt-2">
                                            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{currentConfig.label} Details</h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {currentConfig.requiredFields.map(field => (
                                                    <div key={field.name} className="space-y-2">
                                                        <Label className="text-zinc-900 dark:text-zinc-100">{field.label} {field.required && <span className="text-red-500">*</span>}</Label>
                                                        <MetadataField field={field} value={serviceMetadata[field.name] || ''} onChange={handleMetadataChange} />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label className="text-zinc-900 dark:text-zinc-100">
                                            {selectedType === 'COMPLAINT' ? 'Detailed Description' : 'Additional Notes'}
                                            {selectedType === 'COMPLAINT' && <span className="text-red-500 ml-1">*</span>}
                                        </Label>
                                        <Textarea name="description" rows={4} required={selectedType === 'COMPLAINT'}
                                            value={formData.description} onChange={handleChange}
                                            placeholder="Provide any additional context..."
                                            className="resize-none bg-white dark:bg-[#131313] border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500" />
                                    </div>

                                    {/* ── Document Upload Section ── */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-zinc-900 dark:text-zinc-100">
                                                Supporting Documents
                                                {currentConfig.requiredDocuments.length > 0 ? (
                                                    <span className="ml-2 text-[10px] bg-zinc-100 dark:bg-[#1A1A1A] text-zinc-600 dark:text-zinc-300 px-2 py-0.5 rounded uppercase font-semibold tracking-wider">Required</span>
                                                ) : (
                                                    <span className="ml-2 text-[10px] bg-zinc-50 dark:bg-[#1A1A1A] text-zinc-400 dark:text-zinc-500 px-2 py-0.5 rounded uppercase font-medium tracking-wider border border-zinc-100 dark:border-zinc-800">Optional</span>
                                                )}
                                            </Label>
                                            {totalDocCount > 0 && (
                                                <Badge variant="secondary" className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                                                    {totalDocCount} file{totalDocCount > 1 ? 's' : ''}
                                                </Badge>
                                            )}
                                        </div>

                                        {/* Uploaded Files Preview List */}
                                        {totalDocCount > 0 && (
                                            <div className="space-y-1.5">
                                                {files.map((f, i) => (
                                                    <FilePreviewThumb key={`file-${i}`} file={f}
                                                        onRemove={() => setFiles(files.filter((_, idx) => idx !== i))} />
                                                ))}
                                                {vaultDocs.map((vd, i) => (
                                                    <FilePreviewThumb key={`vault-${vd.name || i}`} isVault url={vd.url}
                                                        file={null} name={vd.name}
                                                        onRemove={() => setVaultDocs(vaultDocs.filter((_, idx) => idx !== i))} />
                                                ))}
                                            </div>
                                        )}

                                        {/* Drop Zone */}
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            onDragOver={(e) => e.preventDefault()}
                                            onDrop={(e) => {
                                                e.preventDefault();
                                                const dropped = Array.from(e.dataTransfer.files);
                                                setFiles(prev => [...prev, ...dropped]);
                                            }}
                                            className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-5 flex flex-col items-center justify-center transition-colors cursor-pointer bg-zinc-50 dark:bg-[#1A1A1A]/50 hover:bg-zinc-100 dark:hover:bg-[#1A1A1A] hover:border-zinc-300 dark:hover:border-zinc-700"
                                        >
                                            <input type="file" className="hidden" ref={fileInputRef} multiple
                                                accept="image/jpeg,image/png,application/pdf"
                                                required={currentConfig.requiredDocuments.length > 0 && totalDocCount === 0}
                                                onChange={e => {
                                                    const selected = Array.from(e.target.files);
                                                    setFiles(prev => [...prev, ...selected]);
                                                    e.target.value = ''; // reset so same file can be re-selected
                                                }} />
                                            <UploadCloud className="w-7 h-7 mb-2 text-zinc-400 dark:text-zinc-500" />
                                            <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Click to upload or drag & drop</p>
                                            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">JPEG, PNG, PDF — max 5 MB each</p>
                                        </div>

                                        {/* Vault KYC Docs */}
                                        {user?.kyc && (user.kyc.aadhaar || user.kyc.pan || user.kyc.dl) && (
                                            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                                                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">Add from your KYC Vault:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {user.kyc.aadhaar && !vaultDocs.some(d => d.name === 'Aadhaar Card') && (
                                                        <Button type="button" variant="outline" size="sm"
                                                            className="h-7 text-xs bg-white dark:bg-[#131313] border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                                                            onClick={() => addVaultDoc('Aadhaar Card', user.kyc.aadhaar)}>
                                                            <ShieldAlert className="w-3 h-3 mr-1 text-emerald-500" /> + Aadhaar
                                                        </Button>
                                                    )}
                                                    {user.kyc.pan && !vaultDocs.some(d => d.name === 'PAN Card') && (
                                                        <Button type="button" variant="outline" size="sm"
                                                            className="h-7 text-xs bg-white dark:bg-[#131313] border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                                                            onClick={() => addVaultDoc('PAN Card', user.kyc.pan)}>
                                                            <ShieldAlert className="w-3 h-3 mr-1 text-emerald-500" /> + PAN
                                                        </Button>
                                                    )}
                                                    {user.kyc.dl && !vaultDocs.some(d => d.name === 'Driving License') && (
                                                        <Button type="button" variant="outline" size="sm"
                                                            className="h-7 text-xs bg-white dark:bg-[#131313] border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                                                            onClick={() => addVaultDoc('Driving License', user.kyc.dl)}>
                                                            <ShieldAlert className="w-3 h-3 mr-1 text-emerald-500" /> + Driving License
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        <div className="flex justify-between">
                            <Button variant="outline" onClick={() => goTo(1)} className="dark:border-zinc-700 dark:text-zinc-300">
                                <ChevronLeft className="w-4 h-4 mr-1" /> Back
                            </Button>
                            <Button type="submit" form="service-form" className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
                                Review Request <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>
                    </motion.div>
                )}

                {/* ── Step 3: Review & Submit ── */}
                {step === 3 && currentConfig && (
                    <motion.div key="step3" variants={variants} initial="initial" animate="animate" exit="exit" className="space-y-6">
                        <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-[#131313] overflow-hidden">
                            {/* Review Header */}
                            <div className="bg-zinc-50 dark:bg-[#1A1A1A] border-b border-zinc-100 dark:border-zinc-800 px-6 py-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-white dark:bg-[#131313] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 flex items-center justify-center">
                                        {React.createElement(currentConfig.icon, { className: "w-5 h-5" })}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{currentConfig.label}</p>
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Review your submission</p>
                                    </div>
                                </div>
                                {/* Top-right action icons */}
                                <div className="flex items-center gap-1">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <button
                                                    type="button"
                                                    title="Expand full screen"
                                                    onClick={() => document.documentElement.requestFullscreen?.()}
                                                    className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                                    </svg>
                                                </button>
                                            </TooltipTrigger>
                                            <TooltipContent className="text-xs">Full screen</TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <button
                                                    type="button"
                                                    title="Download summary"
                                                    onClick={() => {
                                                        const content = [
                                                            `Service: ${currentConfig.label}`,
                                                            `Investor: ${formData.investorName}`,
                                                            `Account: ${formData.accountNumber}`,
                                                            `Title: ${formData.title}`,
                                                            `Notes: ${formData.description}`,
                                                            `Documents: ${[...files.map(f => f.name), ...vaultDocs.map(v => v.name)].join(', ')}`,
                                                        ].join('\n');
                                                        const blob = new Blob([content], { type: 'text/plain' });
                                                        const url = URL.createObjectURL(blob);
                                                        const a = document.createElement('a');
                                                        a.href = url; a.download = 'ticket-review.txt'; a.click();
                                                        URL.revokeObjectURL(url);
                                                    }}
                                                    className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                    </svg>
                                                </button>
                                            </TooltipTrigger>
                                            <TooltipContent className="text-xs">Download summary</TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                            </div>

                            <CardContent className="p-6 space-y-6">
                                <div>
                                    <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest mb-3">Investor Details</h4>
                                    <div className="bg-white dark:bg-[#131313] rounded-lg border border-zinc-100 dark:border-zinc-800 px-4">
                                        <ReviewRow label="Name" value={formData.investorName} />
                                        <ReviewRow label="Account" value={formData.accountNumber} />
                                        <ReviewRow label="Title" value={formData.title} />
                                    </div>
                                </div>

                                {currentConfig.requiredFields.length > 0 && Object.keys(serviceMetadata).length > 0 && (
                                    <div>
                                        <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest mb-3">Service Details</h4>
                                        <div className="bg-white dark:bg-[#131313] rounded-lg border border-zinc-100 dark:border-zinc-800 px-4">
                                            {currentConfig.requiredFields.map(field => (
                                                <ReviewRow key={field.name} label={field.label} value={serviceMetadata[field.name]} />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {formData.description && (
                                    <div>
                                        <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest mb-3">Notes</h4>
                                        <p className="text-sm text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-[#1A1A1A] p-4 rounded-lg border border-zinc-100 dark:border-zinc-800">
                                            "{formData.description}"
                                        </p>
                                    </div>
                                )}

                                {/* Documents in Review */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">Attached Documents</h4>
                                        <Badge variant="secondary" className={`text-[10px] ${totalDocCount > 0 ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>
                                            {totalDocCount} attached
                                        </Badge>
                                    </div>
                                    {totalDocCount > 0 ? (
                                        <div className="space-y-1.5">
                                            {files.map((f, i) => (
                                                <FilePreviewThumb key={`rf-${i}`} file={f} allowPreview={true}
                                                    onRemove={() => setFiles(files.filter((_, idx) => idx !== i))} />
                                            ))}
                                            {vaultDocs.map((vd, i) => (
                                                <FilePreviewThumb key={`rv-${vd.name || i}`} isVault url={vd.url} file={null} name={vd.name} allowPreview={true}
                                                    onRemove={() => setVaultDocs(vaultDocs.filter((_, idx) => idx !== i))} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg p-6 text-center">
                                            <AlertCircle className="w-5 h-5 text-zinc-400 mx-auto mb-1" />
                                            <p className="text-xs text-zinc-400 dark:text-zinc-500">No documents attached.</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex justify-between">
                            <Button variant="outline" onClick={() => goTo(2)} className="dark:border-zinc-700 dark:text-zinc-300">
                                <ChevronLeft className="w-4 h-4 mr-1" /> Edit
                            </Button>
                            <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
                                {isSubmitting ? 'Submitting…' : 'Confirm & Submit'}
                                {!isSubmitting && <Send className="w-4 h-4 ml-2" />}
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CreateTicketFlow;
