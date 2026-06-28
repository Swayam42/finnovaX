const userService = require('../../services/auth/user.service');
const documentService = require('../../services/ticket/document.service');
const axios = require('axios');
const FormData = require('form-data');

exports.updateProfile = async (req, res) => {
    try {
        const updateData = { ...req.body };
        const files = req.files || [];

        const currentUser = await userService.getUserById(req.user.userId);
        if (!currentUser) {
            return res.status(404).json({ message: 'User not found.' });
        }

        let ocrResult = null;

        if (files.length > 0) {
            updateData.kyc = currentUser.toObject().kyc || {};
            const uploadedDocs = await documentService.uploadDocuments(files);
            
            for (let doc of uploadedDocs) {
                const originalFile = files.find(f => f.originalname === doc.name);
                if (originalFile && originalFile.fieldname === 'aadhaarDoc') {
                    updateData.kyc.aadhaar = doc.s3Key;
                } else if (originalFile && originalFile.fieldname === 'panDoc') {
                    updateData.kyc.pan = doc.s3Key;
                }
            }

            // OCR VERIFICATION
            try {
                const formData = new FormData();
                formData.append('target_name', updateData.name || currentUser.name || '');
                formData.append('target_dob', updateData.dob || currentUser.dob || '');
                files.forEach(f => {
                    formData.append('files', f.buffer, {
                        filename: f.originalname,
                        contentType: f.mimetype
                    });
                });
                const pythonUrl = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';
                const ocrRes = await axios.post(`${pythonUrl}/ocr/verify-kyc`, formData, {
                    headers: formData.getHeaders()
                });
                ocrResult = ocrRes.data;
            } catch (e) {
                console.error("OCR Verification Failed:", e.message);
                ocrResult = { match_found: false, message: "OCR Engine Offline or Failed." };
            }
        }

        const checkKyc = updateData.kyc || currentUser.kyc;
        const checkPhone = updateData.phoneNumber || currentUser.phoneNumber;
        const checkDob = updateData.dob || currentUser.dob;
        
        if (updateData.address && typeof updateData.address === 'string') {
            try { updateData.address = JSON.parse(updateData.address); } catch (e) {}
        }
        if (updateData.bankAccount && typeof updateData.bankAccount === 'string') {
            try { updateData.bankAccount = JSON.parse(updateData.bankAccount); } catch (e) {}
        }
        
        const checkAddress = updateData.address || currentUser.address;
        const checkBank = updateData.bankAccount || currentUser.bankAccount;

        const isComplete = Boolean(
            checkPhone && 
            checkDob &&
            checkAddress?.street && 
            checkAddress?.city && 
            checkAddress?.state &&
            checkBank?.bankName &&
            checkBank?.accountNumber &&
            checkBank?.ifsc
        );

        updateData.profileCompleted = isComplete;
        const user = await userService.updateUserProfile(req.user.userId, updateData);

        let missingFields = [];
        if (!isComplete) {
            if (!checkPhone) missingFields.push('Phone Number');
            if (!checkDob) missingFields.push('Date of Birth');
            if (!checkAddress?.street || !checkAddress?.city || !checkAddress?.state) missingFields.push('Full Address');
            if (!checkBank?.bankName || !checkBank?.accountNumber || !checkBank?.ifsc) missingFields.push('Bank Details');
        }

        return res.status(200).json({ 
            message: isComplete ? 'Profile completed successfully!' : `Profile updated, missing: ${missingFields.join(', ')}`, 
            user: userService.getPublicProfile(user),
            ocrResult
        });
    } catch (error) {
        console.error('[Auth] Update profile error:', error);
        return res.status(500).json({ message: 'Internal server error.', error: error.message });
    }
};

exports.uploadDocument = async (req, res) => {
    try {
        const files = req.files || [];
        if (files.length === 0) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }

        const currentUser = await userService.getUserById(req.user.userId);
        if (!currentUser) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const updateData = { kyc: currentUser.toObject().kyc || {} };
        const uploadedDocs = await documentService.uploadDocuments(files);
        
        const fileField = files[0].fieldname;
        let docTypeKey = '';
        if (fileField === 'aadhaarDoc') docTypeKey = 'aadhaar';
        else if (fileField === 'panDoc') docTypeKey = 'pan';
        else if (fileField === 'dlDoc') docTypeKey = 'dl';
        
        if (docTypeKey && uploadedDocs.length > 0) {
            updateData.kyc[docTypeKey] = uploadedDocs[0].s3Key;
        }

        let ocrResult = null;
        try {
            const formData = new FormData();
            formData.append('target_name', currentUser.name || '');
            formData.append('target_dob', currentUser.dob || '');
            formData.append('files', files[0].buffer, {
                filename: files[0].originalname,
                contentType: files[0].mimetype
            });
            const pythonUrl = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';
            const ocrRes = await axios.post(`${pythonUrl}/ocr/verify-kyc`, formData, {
                headers: formData.getHeaders()
            });
            ocrResult = ocrRes.data;
        } catch (e) {
            console.error("OCR Verification Failed:", e.message);
            ocrResult = { match_found: false, message: "OCR Engine Offline or Failed." };
        }

        const checkKyc = updateData.kyc;
        const isComplete = Boolean(
            currentUser.phoneNumber && 
            currentUser.dob &&
            currentUser.address?.street && 
            currentUser.address?.city && 
            currentUser.address?.state &&
            currentUser.bankAccount?.bankName &&
            currentUser.bankAccount?.accountNumber &&
            currentUser.bankAccount?.ifsc
        );

        updateData.profileCompleted = isComplete;
        const user = await userService.updateUserProfile(req.user.userId, updateData);

        return res.status(200).json({ 
            message: 'Document uploaded successfully.', 
            user: userService.getPublicProfile(user),
            ocrResult
        });
    } catch (error) {
        console.error('[Auth] Upload document error:', error);
        return res.status(500).json({ message: 'Internal server error.', error: error.message });
    }
};

exports.deleteDocument = async (req, res) => {
    try {
        const { docType } = req.params; // 'aadhaar', 'pan', 'dl'
        if (!['aadhaar', 'pan', 'dl'].includes(docType)) {
            return res.status(400).json({ message: 'Invalid document type.' });
        }

        const currentUser = await userService.getUserById(req.user.userId);
        if (!currentUser) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const updateData = { kyc: currentUser.toObject().kyc || {} };
        updateData.kyc[docType] = ''; // clear it

        const checkKyc = updateData.kyc;
        const isComplete = Boolean(
            currentUser.phoneNumber && 
            currentUser.dob &&
            currentUser.address?.street && 
            currentUser.address?.city && 
            currentUser.address?.state &&
            currentUser.bankAccount?.bankName &&
            currentUser.bankAccount?.accountNumber &&
            currentUser.bankAccount?.ifsc
        );

        updateData.profileCompleted = isComplete;
        const user = await userService.updateUserProfile(req.user.userId, updateData);

        return res.status(200).json({ 
            message: 'Document removed successfully.', 
            user: userService.getPublicProfile(user)
        });
    } catch (error) {
        console.error('[Auth] Delete document error:', error);
        return res.status(500).json({ message: 'Internal server error.', error: error.message });
    }
};
