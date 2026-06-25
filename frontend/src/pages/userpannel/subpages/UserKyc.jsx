import React, { useState, useEffect, useMemo } from 'react';
import { submitUserKyc, fetchUserExchangeLimits, fetchUserReferrals } from '../../../services/auth';

// Helper to get country flag, name, and document fields/guidelines
const getCountryKycDetails = (countryCode) => {
  const code = countryCode ? countryCode.trim().toUpperCase() : '+91';

  if (code === '+91' || code === 'IN' || code === 'INDIA') {
    return {
      name: 'India',
      flag: '🇮🇳',
      requirements: [
        'A valid 10-digit Permanent Account Number (PAN) is required by FIU guidelines.',
        'A 12-digit Aadhaar Card number or virtual ID.',
        'Selfie must clearly show your face holding both documents next to a handwritten note saying "cashXcrypto" with the current date.'
      ],
      fields: [
        { key: 'pan', label: 'PAN Card Number', placeholder: 'ABCDE1234F', maxLength: 10, pattern: '[A-Z]{5}[0-9]{4}[A-Z]{1}', textTransform: 'uppercase' },
        { key: 'aadhaar', label: 'Aadhaar Card Number', placeholder: '1234 5678 9012', maxLength: 14, pattern: '[0-9\\s]{12,14}' }
      ]
    };
  } else if (code === '+1' || code === 'US' || code === 'USA' || code === 'CA' || code === 'CAN') {
    return {
      name: 'United States / Canada',
      flag: '🇺🇸',
      requirements: [
        'A valid 9-digit Social Security Number (SSN) or ITIN / Social Insurance Number (SIN).',
        'State Driver\'s License or Passport.',
        'Selfie holding your photo ID next to a handwritten note saying "cashXcrypto" with today\'s date.'
      ],
      fields: [
        { key: 'ssn', label: 'SSN / ITIN / SIN Number', placeholder: '9-digit ID Number', maxLength: 11, pattern: '.*' },
        { key: 'passport', label: 'Driver\'s License or Passport Number', placeholder: 'ID or Passport Number', maxLength: 20, pattern: '.*' }
      ]
    };
  } else if (code === '+44' || code === 'GB' || code === 'UK' || code === 'GBR') {
    return {
      name: 'United Kingdom',
      flag: '🇬🇧',
      requirements: [
        'A valid National Insurance Number (NINO).',
        'UK Passport or Biometric Residence Permit.',
        'Selfie holding your UK passport showing the biodata page next to a note reading "cashXcrypto" and the current date.'
      ],
      fields: [
        { key: 'nino', label: 'National Insurance Number (NINO)', placeholder: 'QQ 12 34 56 A', maxLength: 13, pattern: '[A-Z0-9\\s]{9,13}', textTransform: 'uppercase' },
        { key: 'passport', label: 'UK Passport Number', placeholder: '9-digit passport ID', maxLength: 9, pattern: '[0-9]{9}' }
      ]
    };
  } else if (code === '+92' || code === 'PK' || code === 'PAK') {
    return {
      name: 'Pakistan',
      flag: '🇵🇰',
      requirements: [
        'A valid 13-digit Computerized National Identity Card (CNIC) number.',
        'Pakistan Passport Number.',
        'Selfie holding your original CNIC next to a note saying "cashXcrypto" with the current date.'
      ],
      fields: [
        { key: 'cnic', label: 'CNIC Number', placeholder: '12345-1234567-1', maxLength: 15, pattern: '[0-9-]{15}' },
        { key: 'passport', label: 'Passport Number', placeholder: 'Passport ID', maxLength: 9, pattern: '.*' }
      ]
    };
  } else if (code === '+61' || code === 'AU' || code === 'AUS') {
    return {
      name: 'Australia',
      flag: '🇦🇺',
      requirements: [
        'A valid Australian Driver\'s License or Medicare Card.',
        'Australian Passport Number.',
        'Selfie holding your ID next to a handwritten note saying "cashXcrypto" with the current date.'
      ],
      fields: [
        { key: 'driver_license', label: 'Driver\'s License or Medicare Card Number', placeholder: 'ID Number', maxLength: 20, pattern: '.*' },
        { key: 'passport', label: 'Passport Number', placeholder: 'Passport ID', maxLength: 9, pattern: '.*' }
      ]
    };
  } else if (code === '+49' || code === 'DE' || code === 'DEU') {
    return {
      name: 'Germany / Europe',
      flag: '🇩🇪',
      requirements: [
        'A valid National Identity Card (Personalausweis) number.',
        'European Union Passport Number.',
        'Selfie holding your EU Identity Card next to a handwritten note saying "cashXcrypto" with the current date.'
      ],
      fields: [
        { key: 'national_id', label: 'National ID Card Number', placeholder: 'ID Card Number', maxLength: 20, pattern: '.*' },
        { key: 'passport', label: 'Passport Number', placeholder: 'Passport ID', maxLength: 9, pattern: '.*' }
      ]
    };
  } else if (code === '+971' || code === 'AE' || code === 'ARE') {
    return {
      name: 'UAE',
      flag: '🇦🇪',
      requirements: [
        'A valid 15-digit Emirates ID Card Number.',
        'Passport Identifier.',
        'Selfie holding your Emirates ID Card next to a handwritten note saying "cashXcrypto" with the current date.'
      ],
      fields: [
        { key: 'emirates_id', label: 'Emirates ID Number', placeholder: '784-XXXX-XXXXXXX-X', maxLength: 18, pattern: '.*' },
        { key: 'passport', label: 'Passport Number', placeholder: 'Passport ID', maxLength: 20, pattern: '.*' }
      ]
    };
  } else if (code === '+65' || code === 'SG' || code === 'SGP') {
    return {
      name: 'Singapore',
      flag: '🇸🇬',
      requirements: [
        'A valid Singapore NRIC or FIN number.',
        'Singapore Passport Number.',
        'Selfie holding your NRIC/FIN card next to a handwritten note saying "cashXcrypto" with the current date.'
      ],
      fields: [
        { key: 'nric', label: 'NRIC / FIN Number', placeholder: 'S1234567A', maxLength: 9, pattern: '.*', textTransform: 'uppercase' },
        { key: 'passport', label: 'Passport Number', placeholder: 'Passport ID', maxLength: 9, pattern: '.*' }
      ]
    };
  } else if (code === '+966' || code === 'SA' || code === 'SAU') {
    return {
      name: 'Saudi Arabia',
      flag: '🇸🇦',
      requirements: [
        'A valid 10-digit National ID or Iqama Number.',
        'Saudi Passport Identifier.',
        'Selfie holding your Iqama / National ID Card next to a handwritten note saying "cashXcrypto" with the current date.'
      ],
      fields: [
        { key: 'iqama_id', label: 'National ID / Iqama Number', placeholder: '10-digit Number', maxLength: 10, pattern: '[0-9]{10}' },
        { key: 'passport', label: 'Passport Number', placeholder: 'Passport ID', maxLength: 20, pattern: '.*' }
      ]
    };
  } else if (code === '+880' || code === 'BD' || code === 'BGD') {
    return {
      name: 'Bangladesh',
      flag: '🇧🇩',
      requirements: [
        'A valid 10, 13, or 17-digit National ID (NID) Card Number.',
        'Bangladesh Passport Number.',
        'Selfie holding your National ID next to a handwritten note saying "cashXcrypto" with the current date.'
      ],
      fields: [
        { key: 'nid', label: 'National ID (NID) Number', placeholder: 'NID Number', maxLength: 17, pattern: '[0-9]{10,17}' },
        { key: 'passport', label: 'Passport Number', placeholder: 'Passport ID', maxLength: 9, pattern: '.*' }
      ]
    };
  } else if (code === '+977' || code === 'NP' || code === 'NPL') {
    return {
      name: 'Nepal',
      flag: '🇳🇵',
      requirements: [
        'A valid Government Citizenship Card Number.',
        'Nepal Passport Identifier.',
        'Selfie holding your Citizenship Card next to a handwritten note saying "cashXcrypto" with the current date.'
      ],
      fields: [
        { key: 'citizenship_id', label: 'Citizenship Number', placeholder: 'Citizenship ID', maxLength: 25, pattern: '.*' },
        { key: 'passport', label: 'Passport Number', placeholder: 'Passport ID', maxLength: 9, pattern: '.*' }
      ]
    };
  } else if (code === '+94' || code === 'LK' || code === 'LKA') {
    return {
      name: 'Sri Lanka',
      flag: '🇱🇰',
      requirements: [
        'A valid National Identity Card (NIC) number.',
        'Sri Lankan Passport Identifier.',
        'Selfie holding your NIC next to a handwritten note saying "cashXcrypto" with the current date.'
      ],
      fields: [
        { key: 'nic', label: 'National Identity Card (NIC) Number', placeholder: 'NIC ID', maxLength: 12, pattern: '.*' },
        { key: 'passport', label: 'Passport Number', placeholder: 'Passport ID', maxLength: 9, pattern: '.*' }
      ]
    };
  } else {
    return {
      name: 'International (Global)',
      flag: '🌐',
      requirements: [
        'A valid Government-issued National ID Card or Passport.',
        'Selfie holding the identity document showing all details clearly, alongside a handwritten verification note.'
      ],
      fields: [
        { key: 'national_id', label: 'National ID Card Number', placeholder: 'Identity ID Number', maxLength: 20, pattern: '.*' },
        { key: 'passport', label: 'Passport Number', placeholder: 'Passport Identifier', maxLength: 20, pattern: '.*' }
      ]
    };
  }
};

function UserKyc({ kycStatus, setKycStatus, currentUser }) {
  // Re-derive kycDetails reactively so it updates when countryCode loads
  const kycDetails = useMemo(
    () => getCountryKycDetails(currentUser?.countryCode),
    [currentUser?.countryCode]
  );

  const [currentStep, setCurrentStep] = useState(1); // 1 = Documents, 2 = Selfie, 3 = Review & Submit

  const [formData, setFormData] = useState(() => {
    const initial = {};
    if (currentUser?.kycDetails) {
      Object.keys(currentUser.kycDetails).forEach(k => {
        if (k !== 'country') {
          initial[k] = currentUser.kycDetails[k];
        }
      });
    }
    return initial;
  });

  // When the user's country or saved KYC details change, update formData
  useEffect(() => {
    if (currentUser?.kycDetails) {
      const initial = {};
      Object.keys(currentUser.kycDetails).forEach(k => {
        if (k !== 'country') {
          initial[k] = currentUser.kycDetails[k];
        }
      });
      setFormData(initial);
    } else {
      setFormData({});
    }
  }, [currentUser?.countryCode, currentUser?.kycDetails]);

  const [selectedFile, setSelectedFile] = useState(null);
  const [selfieBase64, setSelfieBase64] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [limits, setLimits] = useState({ unverifiedLimit: 120, verifiedDailyLimit: 1200 });
  const [kycRewardConfig, setKycRewardConfig] = useState({ userKycReward: 5.0, minKycRewardDeposit: 100.0 });

  useEffect(() => {
    const loadLimits = async () => {
      try {
        const data = await fetchUserExchangeLimits();
        setLimits(data);
      } catch (err) {
        console.error('Failed to load limits info:', err);
      }
    };
    const loadReferrals = async () => {
      try {
        const data = await fetchUserReferrals();
        if (data) {
          setKycRewardConfig({
            userKycReward: data.userKycReward ?? 5.0,
            minKycRewardDeposit: data.minKycRewardDeposit ?? 100.0
          });
        }
      } catch (err) {
        console.error('Failed to load kyc reward config:', err);
      }
    };
    loadLimits();
    loadReferrals();
  }, []);

  const processFile = (file) => {
    if (!file) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelfieBase64(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // Helper validation checks
  const isStep1Valid = () => {
    return kycDetails.fields.every(field => formData[field.key] && formData[field.key].trim() !== '');
  };

  const isStep2Valid = () => {
    return selfieBase64 && selectedFile;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile || !selfieBase64) {
      alert('Please upload a verification selfie photo before submitting.');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        country: kycDetails.name,
        selfieBase64: selfieBase64,
        selfieName: selectedFile ? selectedFile.name : ''
      };
      await submitUserKyc(payload);
      setKycStatus('Pending');

      // Update local storage user session
      const storedUser = localStorage.getItem('cashXcrypto_user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        parsed.kycStatus = 'Pending';
        const storagePayload = { ...payload };
        delete storagePayload.selfieBase64;
        parsed.kycDetails = storagePayload;
        localStorage.setItem('cashXcrypto_user', JSON.stringify(parsed));
      }

      alert('KYC documents submitted successfully! Review takes 5-10 minutes.');
    } catch (err) {
      alert(`KYC submission failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '60px' }}>
      <style>{`
        .kyc-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
        }
        .kyc-step-tracker {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(255,255,255,0.01);
          border: 1px solid rgba(255,255,255,0.04);
          border-radius: 16px;
          padding: 24px 40px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.1);
        }
        .kyc-grid-layout {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 28px;
          align-items: start;
        }
        @media (max-width: 768px) {
          .kyc-header-row {
            flex-direction: column;
            align-items: flex-start !important;
            gap: 12px;
          }
          .kyc-step-tracker {
            padding: 16px 16px !important;
            justify-content: center !important;
            gap: 8px;
          }
          .kyc-step-tracker .step-label {
            display: none !important;
          }
          .kyc-step-tracker .step-connector {
            margin: 0 8px !important;
          }
        }
        @media (max-width: 992px) {
          .kyc-grid-layout {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
        }
      `}</style>

      {/* Page Title & Breadcrumb */}
      <div className="kyc-header-row">
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '900', margin: 0, letterSpacing: '-0.75px', color: '#fff' }}>
            Verification System
          </h2>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Submit identity details according to local laws for financial compliance.
          </span>
        </div>
        <div style={{
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '30px',
          padding: '6px 16px',
          fontSize: '0.82rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '1.2rem' }}>{kycDetails.flag}</span>
          <span style={{ color: '#fff', fontWeight: '700' }}>{kycDetails.name} Region</span>
        </div>
      </div>

      {/* Step Progress Tracker (Shown for Unverified / Rejected) */}
      {(kycStatus === 'Unverified' || kycStatus === 'Rejected') && (
        <div className="kyc-step-tracker">
          {/* Step 1 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }} onClick={() => setCurrentStep(1)}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: currentStep >= 1 ? 'linear-gradient(135deg, #bd34fe, #ff6b6b)' : 'rgba(255,255,255,0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '800',
              color: '#fff',
              fontSize: '0.9rem',
              boxShadow: currentStep >= 1 ? '0 0 15px rgba(189, 52, 254, 0.4)' : 'none',
              transition: 'all 0.3s ease'
            }}>
              {currentStep > 1 ? '✓' : '1'}
            </div>
            <div className="step-label">
              <span style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: currentStep >= 1 ? '#fff' : 'var(--text-muted)' }}>Documents</span>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Identity numbers</span>
            </div>
          </div>

          <div className="step-connector" style={{ height: '2px', background: currentStep >= 2 ? 'linear-gradient(90deg, #bd34fe, #ff6b6b)' : 'rgba(255,255,255,0.05)', flex: 1, margin: '0 20px', transition: 'all 0.3s ease' }} />

          {/* Step 2 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: isStep1Valid() ? 'pointer' : 'not-allowed' }} onClick={() => isStep1Valid() && setCurrentStep(2)}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: currentStep >= 2 ? 'linear-gradient(135deg, #bd34fe, #ff6b6b)' : 'rgba(255,255,255,0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '800',
              color: '#fff',
              fontSize: '0.9rem',
              boxShadow: currentStep >= 2 ? '0 0 15px rgba(189, 52, 254, 0.4)' : 'none',
              transition: 'all 0.3s ease'
            }}>
              {currentStep > 2 ? '✓' : '2'}
            </div>
            <div className="step-label">
              <span style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: currentStep >= 2 ? '#fff' : 'var(--text-muted)' }}>Selfie Upload</span>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Verification photo</span>
            </div>
          </div>

          <div className="step-connector" style={{ height: '2px', background: currentStep >= 3 ? 'linear-gradient(90deg, #bd34fe, #ff6b6b)' : 'rgba(255,255,255,0.05)', flex: 1, margin: '0 20px', transition: 'all 0.3s ease' }} />

          {/* Step 3 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: (isStep1Valid() && isStep2Valid()) ? 'pointer' : 'not-allowed' }} onClick={() => isStep1Valid() && isStep2Valid() && setCurrentStep(3)}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: currentStep >= 3 ? 'linear-gradient(135deg, #bd34fe, #ff6b6b)' : 'rgba(255,255,255,0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '800',
              color: '#fff',
              fontSize: '0.9rem',
              boxShadow: currentStep >= 3 ? '0 0 15px rgba(189, 52, 254, 0.4)' : 'none',
              transition: 'all 0.3s ease'
            }}>
              3
            </div>
            <div className="step-label">
              <span style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: currentStep >= 3 ? '#fff' : 'var(--text-muted)' }}>Review & Submit</span>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Submit for verification</span>
            </div>
          </div>
        </div>
      )}

      {/* 1. Verified Status View */}
      {kycStatus === 'Verified' && (
        <div className="glass-panel" style={{
          padding: '50px 30px',
          textAlign: 'center',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(6, 9, 20, 0.4) 100%)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '2px solid rgba(16, 185, 129, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 0 25px rgba(16, 185, 129, 0.3)'
          }}>
            <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: 'auto' }}>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              <polyline points="9 11 11 13 15 9"></polyline>
            </svg>
          </div>

          <h4 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#10b981', margin: '0 0 10px 0', letterSpacing: '-0.5px' }}>
            Account Fully Verified
          </h4>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 32px', lineHeight: '1.6' }}>
            Your compliance identity has been verified matching regulations for <strong>{kycDetails.name}</strong>. Your exchange and transaction caps have been lifted.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', maxWidth: '540px', margin: '0 auto' }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)', textAlign: 'center' }}>
              <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Daily Exchange Limit</span>
              <span style={{ fontSize: '1.25rem', fontWeight: '900', color: '#fff', display: 'block', marginTop: '6px' }}>
                {Number(limits.verifiedDailyLimit).toLocaleString('en-US')} USDT
              </span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)', textAlign: 'center' }}>
              <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Settlement Speed</span>
              <span style={{ fontSize: '1.25rem', fontWeight: '900', color: '#10b981', display: 'block', marginTop: '6px' }}>Instant / Done</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. Pending Status View */}
      {kycStatus === 'Pending' && (
        <div className="glass-panel" style={{
          padding: '50px 30px',
          textAlign: 'center',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.03) 0%, rgba(6, 9, 20, 0.4) 100%)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'rgba(245, 158, 11, 0.1)',
            border: '2px solid rgba(245, 158, 11, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 0 25px rgba(245, 158, 11, 0.2)'
          }}>
            <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: 'auto' }}>
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>

          <h4 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#f59e0b', margin: '0 0 10px 0', letterSpacing: '-0.5px' }}>
            Verification in Progress
          </h4>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 32px', lineHeight: '1.6' }}>
            We have received your identity documentation for <strong>{kycDetails.name}</strong>. Verification queues are currently short. Verification usually completes within 5-10 minutes.
          </p>

          <div style={{ maxWidth: '440px', margin: '0 auto', background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: '16px', textAlign: 'left' }}>
            <div style={{ display: 'flex', position: 'relative', width: '32px', height: '32px', flexShrink: 0 }}>
              <div style={{ width: '100%', height: '100%', border: '3px solid rgba(245, 158, 11, 0.15)', borderTopColor: '#f59e0b', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', color: '#fff' }}>Awaiting Admin Compliance Approval</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px', lineHeight: '1.3' }}>Your KYC details have been safely queued. We will notify you instantly on approval.</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Unverified / Rejected Form Layout (Wizard-style) */}
      {(kycStatus === 'Unverified' || kycStatus === 'Rejected') && (
        <div className="kyc-grid-layout">

          {/* Wizard Form Panel */}
          <div className="glass-panel" style={{ padding: '36px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>

            {kycStatus === 'Rejected' && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '10px',
                padding: '16px',
                marginBottom: '28px',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start'
              }}>
                <span style={{ fontSize: '1.25rem', marginTop: '-2px' }}>⚠️</span>
                <div>
                  <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', color: '#ef4444' }}>
                    Verification Rejected
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginTop: '2px', lineHeight: '1.4' }}>
                    Your previous verification details were rejected. Please check requirements carefully and submit correct parameters.
                  </span>
                </div>
              </div>
            )}

            {/* STEP 1: Document Details */}
            {currentStep === 1 && (
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '900', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#fff' }}>
                  <span>📋</span> Step 1: Document Identification
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
                  Please enter official identity numbers accurately to pass the verification rules.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {kycDetails.fields.map(field => (
                    <div key={field.key} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label className="input-label" style={{ margin: 0, fontWeight: '750', fontSize: '0.82rem', color: '#fff' }}>
                          {field.label}
                        </label>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Required</span>
                      </div>
                      <input
                        type="text"
                        className="step-input"
                        placeholder={field.placeholder}
                        maxLength={field.maxLength}
                        required
                        value={formData[field.key] || ''}
                        style={{
                          textTransform: field.textTransform || 'none',
                          background: 'rgba(255, 255, 255, 0.02)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '10px',
                          padding: '14px 16px',
                          color: '#fff',
                          fontSize: '0.9rem',
                          outline: 'none',
                          transition: 'all 0.2s'
                        }}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                      />
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px' }}>
                  <button
                    type="button"
                    disabled={!isStep1Valid()}
                    className="btn btn-primary"
                    style={{
                      padding: '12px 28px',
                      fontSize: '0.85rem',
                      fontWeight: '800',
                      opacity: isStep1Valid() ? 1 : 0.5,
                      cursor: isStep1Valid() ? 'pointer' : 'not-allowed',
                      background: 'linear-gradient(135deg, #bd34fe, #ff6b6b)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onClick={() => setCurrentStep(2)}
                  >
                    Next: Upload Selfie ➔
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Selfie Upload */}
            {currentStep === 2 && (
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '900', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#fff' }}>
                  <span>📸</span> Step 2: Upload Verification Selfie
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
                  Take a photo holding your documents alongside a handwritten paper with the word "cashXcrypto" and current date.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    style={{
                      border: isDragging ? '2.5px dashed #bd34fe' : '2px dashed rgba(255,255,255,0.08)',
                      borderRadius: '14px',
                      padding: '44px 20px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      background: isDragging ? 'rgba(189, 52, 254, 0.05)' : 'rgba(255,255,255,0.01)',
                      transition: 'all 0.25s',
                      position: 'relative'
                    }}
                  >
                    <input
                      type="file"
                      id="kyc-file-upload"
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                      onChange={handleFileChange}
                      accept="image/*"
                    />

                    {selectedFile ? (
                      <div>
                        {selfieBase64 ? (
                          <img
                            src={selfieBase64}
                            alt="Selfie Preview"
                            style={{
                              width: '120px',
                              height: '120px',
                              objectFit: 'cover',
                              borderRadius: '12px',
                              marginBottom: '14px',
                              border: '2px solid rgba(255,255,255,0.15)',
                              boxShadow: '0 8px 20px rgba(0,0,0,0.4)'
                            }}
                          />
                        ) : (
                          <div style={{ fontSize: '3rem', marginBottom: '14px' }}>📄</div>
                        )}
                        <span style={{ fontSize: '0.88rem', fontWeight: '800', color: '#fff', display: 'block', padding: '0 10px', wordBreak: 'break-all' }}>
                          {selectedFile.name}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Tap to replace
                        </span>
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontSize: '3rem', marginBottom: '14px', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}>📷</div>
                        <span style={{ fontSize: '0.88rem', fontWeight: '700', color: '#fff', display: 'block', marginBottom: '4px' }}>
                          Drag and drop file here or click to select selfie
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          Supports JPEG, PNG (Max size: 8MB)
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
                  <button
                    type="button"
                    className="btn"
                    style={{
                      padding: '12px 24px',
                      fontSize: '0.85rem',
                      fontWeight: '800',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#fff',
                      background: 'rgba(255,255,255,0.03)'
                    }}
                    onClick={() => setCurrentStep(1)}
                  >
                    ➔ Back
                  </button>
                  <button
                    type="button"
                    disabled={!isStep2Valid()}
                    className="btn btn-primary"
                    style={{
                      padding: '12px 28px',
                      fontSize: '0.85rem',
                      fontWeight: '800',
                      opacity: isStep2Valid() ? 1 : 0.5,
                      cursor: isStep2Valid() ? 'pointer' : 'not-allowed',
                      background: 'linear-gradient(135deg, #bd34fe, #ff6b6b)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onClick={() => setCurrentStep(3)}
                  >
                    Next: Review & Submit ➔
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Review & Submit */}
            {currentStep === 3 && (
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '900', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#fff' }}>
                  <span>🚀</span> Step 3: Review & Submit Verification
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
                  Please confirm all details are correct. Inaccurate submissions will be instantly rejected.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '12px', padding: '20px' }}>

                  {/* Info recap */}
                  {kycDetails.fields.map(field => (
                    <div key={field.key} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '10px' }}>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{field.label}</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: '750', color: '#fff', textTransform: field.textTransform || 'none' }}>
                        {formData[field.key] || 'N/A'}
                      </span>
                    </div>
                  ))}

                  {/* Photo recap */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Verification Photo</span>
                    {selfieBase64 ? (
                      <img
                        src={selfieBase64}
                        alt="Verification Selfie"
                        style={{
                          width: '48px',
                          height: '48px',
                          objectFit: 'cover',
                          borderRadius: '6px',
                          border: '1px solid rgba(255,255,255,0.1)'
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: '0.82rem', color: 'var(--danger)' }}>Missing photo</span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
                  <button
                    type="button"
                    className="btn"
                    style={{
                      padding: '12px 24px',
                      fontSize: '0.85rem',
                      fontWeight: '800',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#fff',
                      background: 'rgba(255,255,255,0.03)'
                    }}
                    onClick={() => setCurrentStep(2)}
                  >
                    ➔ Back
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting || !isStep1Valid() || !isStep2Valid()}
                    className="btn btn-primary"
                    onClick={handleSubmit}
                    style={{
                      padding: '12px 32px',
                      fontSize: '0.85rem',
                      fontWeight: '800',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      background: 'linear-gradient(135deg, #10b981, #059669)'
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }}></div>
                        <span>Submitting KYC...</span>
                      </>
                    ) : (
                      <span>Submit Verification</span>
                    )}
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Right Sidebar Guidelines & Limits */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* KYC Reward Card */}
            <div className="glass-panel" style={{
              padding: '20px',
              borderRadius: '16px',
              border: '1px solid rgba(251, 191, 36, 0.3)',
              background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.08) 0%, rgba(6, 9, 20, 0.5) 100%)',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)'
            }}>
              <h4 style={{
                fontSize: '0.85rem',
                fontWeight: '900',
                margin: '0 0 10px 0',
                textTransform: 'uppercase',
                letterSpacing: '0.7px',
                color: '#fbbf24',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>🎁</span> KYC Reward Program
              </h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0 0 12px 0', lineHeight: '1.4' }}>
                Complete your verification and deposit a total of <strong style={{ color: '#fbbf24' }}>{kycRewardConfig.minKycRewardDeposit}+ USDT</strong> to instantly receive a welcome bonus of <strong style={{ color: '#fbbf24' }}>{kycRewardConfig.userKycReward} USDT</strong> credited directly to your trading account.
              </p>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>✓</span> Automated reward instant credit
              </div>
            </div>

            {/* Exchange Limits Comparison Card */}
            <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', border: '1px solid rgba(255, 23, 68, 0.2)', background: 'linear-gradient(135deg, rgba(255, 23, 68, 0.02) 0%, rgba(6, 9, 20, 0.4) 100%)' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: '800', margin: '0 0 14px 0', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>⚡</span> Exchange Limits
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Unverified Daily Limit</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fff' }}>
                    {Number(limits.unverifiedLimit).toLocaleString('en-US')} USDT
                  </span>
                </div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
                  <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Verified Daily Limit</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#4ade80' }}>
                    {Number(limits.verifiedDailyLimit).toLocaleString('en-US')} USDT
                  </span>
                </div>
              </div>
            </div>

            {/* Country Guidelines Card */}
            <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: '800', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)' }}>
                <span>{kycDetails.flag}</span>
                <span>{kycDetails.name} Guidelines</span>
              </h4>
              <ul style={{ paddingLeft: '16px', margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                {kycDetails.requirements.map((req, i) => (
                  <li key={i}>{req}</li>
                ))}
              </ul>
            </div>

            {/* General Advice Checklist */}
            <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)', background: 'linear-gradient(180deg, rgba(255,255,255,0.01) 0%, rgba(255,255,255,0.0) 100%)' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: '800', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>
                Selfie Checklist
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  'Ensure high, bright ambient lighting.',
                  'Photos must have no glare or blur.',
                  'IDs must not be expired.',
                  'Handwritten note details must match.'
                ].map((text, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    <span style={{ color: 'var(--color-primary)' }}>✓</span>
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Dynamic Keyframes inject */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}} />

    </div>
  );
}

export default UserKyc;
