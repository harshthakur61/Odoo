import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_BASE = 'http://localhost:5000';

const DriverVerification = () => {
  const { hasRole } = useAuth();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [driverDocs, setDriverDocs] = useState([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [docsError, setDocsError] = useState('');
  const [rejectDocId, setRejectDocId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const loadDrivers = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get(`${API_BASE}/api/drivers`);
      setDrivers(res.data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load drivers');
    } finally {
      setLoading(false);
    }
  };

  const loadDriverDocs = async (driverId) => {
    try {
      setDocsLoading(true);
      setDocsError('');
      const res = await axios.get(`${API_BASE}/api/documents/driver/${driverId}`);
      setDriverDocs(res.data || []);
    } catch (err) {
      setDocsError(err.response?.data?.error || 'Failed to load documents');
    } finally {
      setDocsLoading(false);
    }
  };

  const openReview = async (driver) => {
    setSelectedDriver(driver);
    setRejectDocId(null);
    setRejectReason('');
    await loadDriverDocs(driver.id);
  };

  const closeReview = () => {
    setSelectedDriver(null);
    setDriverDocs([]);
    setDocsError('');
    setRejectDocId(null);
    setRejectReason('');
  };

  const verifyDoc = async (docId) => {
    try {
      await axios.put(`${API_BASE}/api/documents/${docId}/verify`);
      if (selectedDriver) await loadDriverDocs(selectedDriver.id);
    } catch (err) {
      setDocsError(err.response?.data?.error || 'Failed to verify document');
    }
  };

  const rejectDoc = async () => {
    if (!rejectDocId) return;
    const reason = rejectReason.trim();
    if (!reason) {
      setDocsError('Rejection reason is required');
      return;
    }
    try {
      await axios.put(`${API_BASE}/api/documents/${rejectDocId}/reject`, { rejectionReason: reason });
      setRejectDocId(null);
      setRejectReason('');
      if (selectedDriver) await loadDriverDocs(selectedDriver.id);
    } catch (err) {
      setDocsError(err.response?.data?.error || 'Failed to reject document');
    }
  };

  useEffect(() => {
    if (hasRole('Fleet Manager')) {
      loadDrivers();
    }
  }, [hasRole]);

  const docStatusConfig = useMemo(() => ({
    PENDING: { label: 'Pending', bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
    VERIFIED: { label: 'Verified', bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/20' },
    REJECTED: { label: 'Rejected', bg: 'bg-error/10', text: 'text-error', border: 'border-error/20' },
    EXPIRED: { label: 'Expired', bg: 'bg-error/10', text: 'text-error', border: 'border-error/20' },
  }), []);

  const getDriverVerificationStatus = (driver) => {
    const driverDocuments = drivers.find(d => d.id === driver.id)?.documents || [];
    const hasPending = driverDocuments.some(d => d.status === 'PENDING');
    const hasRejected = driverDocuments.some(d => d.status === 'REJECTED');
    const hasExpired = driverDocuments.some(d => d.status === 'EXPIRED');
    const allVerified = driverDocuments.length > 0 && driverDocuments.every(d => d.status === 'VERIFIED');
    
    if (driverDocuments.length === 0) return { label: 'No Documents', class: 'bg-gray-100 text-gray-600 border-gray-200' };
    if (hasRejected) return { label: 'Documents Rejected', class: 'bg-error/10 text-error border-error/20' };
    if (hasExpired) return { label: 'Documents Expired', class: 'bg-error/10 text-error border-error/20' };
    if (hasPending) return { label: 'Pending Review', class: 'bg-amber-100 text-amber-700 border-amber-200' };
    if (allVerified) return { label: 'Fully Verified', class: 'bg-primary/10 text-primary border-primary/20' };
    return { label: 'Unknown', class: 'bg-gray-100 text-gray-600 border-gray-200' };
  };

  return (
    <div className="space-y-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md mb-lg">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Driver Verification</h1>
          <p className="text-body-md text-on-surface-variant">Review and verify driver documents for compliance.</p>
        </div>
        <button 
          className="bg-primary text-white px-lg py-md rounded-lg font-label-md flex items-center gap-sm hover:brightness-110 active:scale-95 transition-all shadow-sm"
          onClick={loadDrivers}
        >
          <span className="material-symbols-outlined text-[20px]">refresh</span>
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-md bg-error/5 border border-error/20 rounded-lg text-body-md text-error">
          {error}
        </div>
      )}

      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-xl text-center text-body-md text-secondary">Loading drivers...</div>
        ) : drivers.length === 0 ? (
          <div className="p-xl text-center text-body-md text-secondary">No drivers found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-left">
                  <th className="p-4 font-label-md text-label-md text-outline uppercase tracking-wider">Driver Name</th>
                  <th className="p-4 font-label-md text-label-md text-outline uppercase tracking-wider">License #</th>
                  <th className="p-4 font-label-md text-label-md text-outline uppercase tracking-wider">License Category</th>
                  <th className="p-4 font-label-md text-label-md text-outline uppercase tracking-wider">License Expiry</th>
                  <th className="p-4 font-label-md text-label-md text-outline uppercase tracking-wider">Status</th>
                  <th className="p-4 font-label-md text-label-md text-outline uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="font-body-md divide-y divide-outline-variant">
                {drivers.map(driver => {
                  const status = getDriverVerificationStatus(driver);
                  const expiryDate = new Date(driver.licenseExpiry);
                  const isExpired = expiryDate < new Date();
                  const daysLeft = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24));

                  return (
                    <tr key={driver.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="p-4 font-bold">{driver.name}</td>
                      <td className="p-4 text-secondary">{driver.licenseNumber}</td>
                      <td className="p-4">
                        <span className="bg-surface-container border border-outline-variant px-2 py-0.5 rounded text-label-sm text-secondary">{driver.licenseCategory}</span>
                      </td>
                      <td className="p-4">
                        <div className={`text-body-md font-medium ${isExpired ? 'text-error font-semibold' : 'text-on-surface'}`}>
                          {expiryDate.toLocaleDateString()}
                        </div>
                        <div className={`text-label-sm ${isExpired ? 'text-error/80' : 'text-secondary'}`}>
                          {isExpired ? 'Expired' : `${daysLeft} days left`}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-label-sm font-semibold border ${status.class}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          className="text-primary hover:bg-primary/10 px-sm py-1 rounded transition-colors text-label-sm font-bold"
                          onClick={() => openReview(driver)}
                        >
                          Review Documents
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Document Review Modal */}
      {selectedDriver && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-md">
          <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" onClick={closeReview}></div>
          <div className="bg-white rounded-lg border border-outline-variant w-full max-w-3xl relative overflow-hidden">
            <div className="px-lg py-md border-b border-outline-variant flex justify-between items-center">
              <div>
                <h3 className="font-headline-md text-headline-md">Review Driver Documents</h3>
                <p className="text-body-md text-secondary mt-1">{selectedDriver.name}</p>
              </div>
              <button className="material-symbols-outlined text-secondary hover:text-on-surface" onClick={closeReview} type="button">close</button>
            </div>

            <div className="p-lg space-y-md">
              {docsError && (
                <div className="p-md bg-error/5 border border-error/20 rounded-lg text-body-md text-error">
                  {docsError}
                </div>
              )}

              {docsLoading ? (
                <div className="text-body-md text-secondary">Loading documents...</div>
              ) : (
                <div className="border border-outline-variant rounded-lg overflow-hidden">
                  <div className="bg-surface-container-low px-md py-3 text-label-sm text-secondary font-semibold uppercase tracking-wider">
                    Uploaded Documents
                  </div>
                  <div className="divide-y divide-outline-variant">
                    {driverDocs.map(doc => {
                      const sc = docStatusConfig[doc.status] || docStatusConfig.PENDING;
                      return (
                        <div key={doc.id} className="px-md py-md flex flex-col md:flex-row md:items-center md:justify-between gap-md">
                          <div className="min-w-0">
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className="font-body-md font-semibold text-on-surface">{doc.type}</span>
                              <span className={`${sc.bg} ${sc.text} px-2 py-1 rounded-full text-label-sm font-semibold border ${sc.border}`}>
                                {sc.label}
                              </span>
                              <a
                                className="text-primary font-semibold text-label-md hover:underline"
                                href={`${API_BASE}${doc.fileUrl}`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                View Document
                              </a>
                            </div>
                            <div className="text-label-sm text-secondary mt-xs">
                              Uploaded {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleString() : '-'}{' '}
                              {doc.verifiedAt && ` • Verified ${new Date(doc.verifiedAt).toLocaleString()}`}
                            </div>
                            {doc.status === 'REJECTED' && doc.rejectionReason && (
                              <div className="text-label-sm text-error mt-xs">
                                Rejection reason: {doc.rejectionReason}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 justify-end">
                            {doc.status !== 'VERIFIED' && (
                              <button
                                className="px-3 py-1 rounded border border-primary/30 text-primary hover:bg-primary/10 transition-colors text-label-md font-semibold"
                                onClick={() => verifyDoc(doc.id)}
                                type="button"
                              >
                                Verify
                              </button>
                            )}
                            {doc.status !== 'REJECTED' && (
                              <button
                                className="px-3 py-1 rounded border border-error/30 text-error hover:bg-error/10 transition-colors text-label-md font-semibold"
                                onClick={() => { setRejectDocId(doc.id); setRejectReason(''); setDocsError(''); }}
                                type="button"
                              >
                                Reject
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {driverDocs.length === 0 && (
                      <div className="px-md py-lg text-body-md text-secondary">
                        No documents uploaded for this driver yet.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {rejectDocId && (
                <div className="border border-outline-variant rounded-lg p-md">
                  <div className="flex items-center justify-between gap-md">
                    <div className="font-body-md font-semibold text-on-surface">Rejection Reason</div>
                    <button className="material-symbols-outlined text-secondary hover:text-on-surface" onClick={() => { setRejectDocId(null); setRejectReason(''); }} type="button">close</button>
                  </div>
                  <div className="mt-sm grid grid-cols-1 md:grid-cols-4 gap-md items-end">
                    <div className="md:col-span-3">
                      <input
                        className="w-full border border-outline-variant rounded-lg text-body-md focus:ring-primary focus:border-primary p-2.5"
                        placeholder="Why is this document rejected?"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                      />
                    </div>
                    <button
                      className="bg-error text-white px-4 py-2 rounded-lg font-label-md hover:bg-opacity-90 transition-all"
                      onClick={rejectDoc}
                      type="button"
                    >
                      Confirm Reject
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverVerification;
