import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API_BASE = 'http://localhost:5000';

const mockDriverProfile = {
  name: 'Elena Rodriguez',
  email: 'field@transitops.com',
  phone: '+1 (555) 234-8871',
  employeeId: 'DRV-005',
  joinDate: 'Mar 14, 2022',
  license: {
    number: 'IL-DL-2209847',
    category: 'Class A CDL',
    expiry: 'Aug 30, 2027',
    issuedBy: 'Illinois DMV',
  },
  stats: {
    totalTrips: 148,
    completedTrips: 144,
    declinedTrips: 4,
    totalDistance: '18,420 km',
    safetyScore: 94,
    onTimeRate: '97%',
  },
  currentStatus: 'Available',
  vehicle: 'Ford Transit (VAN-042)',
  recentActivity: [
    { date: 'Jul 11, 2026', activity: 'Completed Trip TRP-9041', type: 'success' },
    { date: 'Jul 10, 2026', activity: 'Completed Trip TRP-9038', type: 'success' },
    { date: 'Jul 9, 2026', activity: 'Declined Trip TRP-9032', type: 'warning' },
    { date: 'Jul 8, 2026', activity: 'Completed Trip TRP-9029', type: 'success' },
  ],
};

const DriverProfile = () => {
  const { user } = useAuth();
  const profile = mockDriverProfile;
  const [documents, setDocuments] = useState([]);
  const [docType, setDocType] = useState('LICENSE');
  const [docFile, setDocFile] = useState(null);
  const [docError, setDocError] = useState('');
  const [docUploading, setDocUploading] = useState(false);

  const licenseExpiryDate = new Date(profile.license.expiry);
  const today = new Date();
  const daysUntilExpiry = Math.ceil((licenseExpiryDate - today) / (1000 * 60 * 60 * 24));
  const isExpiringSoon = daysUntilExpiry < 90;

  const docStatusConfig = useMemo(() => ({
    PENDING: { label: 'Pending', bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
    VERIFIED: { label: 'Verified', bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/20' },
    REJECTED: { label: 'Rejected', bg: 'bg-error/10', text: 'text-error', border: 'border-error/20' },
    EXPIRED: { label: 'Expired', bg: 'bg-error/10', text: 'text-error', border: 'border-error/20' },
  }), []);

  const loadDocuments = async () => {
    try {
      setDocError('');
      const res = await axios.get(`${API_BASE}/api/documents/me`);
      setDocuments(res.data || []);
    } catch (e) {
      setDocError(e.response?.data?.error || 'Failed to load documents');
    }
  };

  useEffect(() => {
    if (user?.role === 'Driver') {
      loadDocuments();
    }
  }, [user?.role]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!docFile) {
      setDocError('Please choose a file to upload');
      return;
    }

    try {
      setDocUploading(true);
      setDocError('');

      const fd = new FormData();
      fd.append('type', docType);
      fd.append('file', docFile);

      await axios.post(`${API_BASE}/api/documents`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setDocFile(null);
      await loadDocuments();
    } catch (e2) {
      setDocError(e2.response?.data?.error || 'Upload failed');
    } finally {
      setDocUploading(false);
    }
  };

  return (
    <div className="space-y-lg max-w-5xl">
      {/* Page Header */}
      <div>
        <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface">My Profile</h2>
        <p className="text-body-md text-secondary mt-1">Your personal details, license information, and performance stats.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        {/* Left Column: Identity Card */}
        <div className="lg:col-span-1 space-y-lg">
          {/* Driver Card */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
            <div className="bg-primary p-lg text-white flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-white/20 border-4 border-white/40 flex items-center justify-center mb-md">
                <span className="text-3xl font-bold">{profile.name.charAt(0)}</span>
              </div>
              <h3 className="font-headline-md text-headline-md font-bold">{profile.name}</h3>
              <p className="text-label-sm opacity-80 mt-1">ID: {profile.employeeId}</p>
              <span className="mt-md px-4 py-1 bg-white/20 text-white rounded-full text-label-sm font-bold border border-white/30">
                {profile.currentStatus}
              </span>
            </div>
            <div className="p-md space-y-sm">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary text-[20px]">mail</span>
                <span className="text-body-md">{profile.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary text-[20px]">phone</span>
                <span className="text-body-md">{profile.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary text-[20px]">calendar_today</span>
                <span className="text-body-md">Joined {profile.joinDate}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary text-[20px]">local_shipping</span>
                <span className="text-body-md">{profile.vehicle}</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md">
            <h4 className="font-label-md text-label-md text-secondary uppercase tracking-wider font-bold mb-md">Recent Activity</h4>
            <div className="space-y-sm">
              {profile.recentActivity.map((item, idx) => (
                <div key={idx} className="flex gap-3 items-start">
                  <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${item.type === 'success' ? 'bg-primary' : 'bg-error'}`}></span>
                  <div>
                    <p className="text-body-md text-on-surface">{item.activity}</p>
                    <p className="text-label-sm text-secondary">{item.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Stats & License */}
        <div className="lg:col-span-2 space-y-lg">
          {/* Performance Stats */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg">
            <h4 className="font-headline-md text-headline-md font-bold text-on-surface mb-lg">Performance Overview</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-md">
              <div className="bg-surface-container-low rounded-xl p-md text-center">
                <p className="text-label-sm text-secondary uppercase tracking-wider">Total Trips</p>
                <p className="text-headline-lg font-headline-lg font-bold text-primary mt-sm">{profile.stats.totalTrips}</p>
              </div>
              <div className="bg-surface-container-low rounded-xl p-md text-center">
                <p className="text-label-sm text-secondary uppercase tracking-wider">Completed</p>
                <p className="text-headline-lg font-headline-lg font-bold text-primary mt-sm">{profile.stats.completedTrips}</p>
              </div>
              <div className="bg-surface-container-low rounded-xl p-md text-center">
                <p className="text-label-sm text-secondary uppercase tracking-wider">Declined</p>
                <p className="text-headline-lg font-headline-lg font-bold text-error mt-sm">{profile.stats.declinedTrips}</p>
              </div>
              <div className="bg-surface-container-low rounded-xl p-md text-center">
                <p className="text-label-sm text-secondary uppercase tracking-wider">Total Distance</p>
                <p className="text-headline-lg font-headline-lg font-bold text-on-surface mt-sm">{profile.stats.totalDistance}</p>
              </div>
              <div className="bg-surface-container-low rounded-xl p-md text-center">
                <p className="text-label-sm text-secondary uppercase tracking-wider">On-Time Rate</p>
                <p className="text-headline-lg font-headline-lg font-bold text-primary mt-sm">{profile.stats.onTimeRate}</p>
              </div>
              <div className="bg-surface-container-low rounded-xl p-md text-center">
                <p className="text-label-sm text-secondary uppercase tracking-wider">Safety Score</p>
                <p className="text-headline-lg font-headline-lg font-bold text-primary mt-sm">{profile.stats.safetyScore}</p>
              </div>
            </div>

            {/* Safety Score Bar */}
            <div className="mt-lg">
              <div className="flex justify-between items-center mb-sm">
                <span className="text-label-md text-secondary font-bold">Safety Score</span>
                <span className="text-label-md font-bold text-primary">{profile.stats.safetyScore}/100</span>
              </div>
              <div className="w-full h-3 bg-surface-container rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-700"
                  style={{ width: `${profile.stats.safetyScore}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* License Details */}
          <div className={`bg-surface-container-lowest border rounded-xl p-lg ${isExpiringSoon ? 'border-error/40' : 'border-outline-variant'}`}>
            <div className="flex justify-between items-start mb-lg">
              <h4 className="font-headline-md text-headline-md font-bold text-on-surface">Driver License</h4>
              {isExpiringSoon && (
                <div className="flex items-center gap-1 px-3 py-1 bg-error/10 text-error rounded-full text-label-sm font-bold border border-error/20">
                  <span className="material-symbols-outlined text-[14px]">warning</span>
                  Expiring in {daysUntilExpiry} days
                </div>
              )}
            </div>

            <div className="bg-surface-container rounded-xl p-md border border-outline-variant">
              {/* License Card Mockup */}
              <div className="flex items-center gap-md mb-md">
                <div className="w-16 h-16 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-white text-[32px]">badge</span>
                </div>
                <div>
                  <p className="font-headline-md text-headline-md font-bold">{profile.name}</p>
                  <p className="text-label-sm text-secondary">{profile.license.category}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-md">
                <div>
                  <p className="text-label-sm text-secondary uppercase tracking-wider">License Number</p>
                  <p className="font-body-md font-bold mt-xs font-mono">{profile.license.number}</p>
                </div>
                <div>
                  <p className="text-label-sm text-secondary uppercase tracking-wider">Category</p>
                  <p className="font-body-md font-bold mt-xs">{profile.license.category}</p>
                </div>
                <div>
                  <p className="text-label-sm text-secondary uppercase tracking-wider">Expiry Date</p>
                  <p className={`font-body-md font-bold mt-xs ${isExpiringSoon ? 'text-error' : 'text-on-surface'}`}>{profile.license.expiry}</p>
                </div>
                <div>
                  <p className="text-label-sm text-secondary uppercase tracking-wider">Issued By</p>
                  <p className="font-body-md font-bold mt-xs">{profile.license.issuedBy}</p>
                </div>
              </div>
            </div>

            {isExpiringSoon && (
              <div className="mt-md p-md bg-error/5 border border-error/20 rounded-lg">
                <p className="text-body-md text-error flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">info</span>
                  Please renew your license before {profile.license.expiry} to remain eligible for trip assignments.
                </p>
              </div>
            )}
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg">
            <div className="flex items-start justify-between gap-md mb-lg">
              <div>
                <h4 className="font-headline-md text-headline-md font-bold text-on-surface">Compliance Documents</h4>
                <p className="text-body-md text-secondary mt-1">Upload your license and insurance documents for verification.</p>
              </div>
              <button
                className="px-4 py-2 rounded-lg border border-outline-variant text-label-md hover:bg-surface-container transition-colors"
                onClick={loadDocuments}
                type="button"
              >
                Refresh
              </button>
            </div>

            {docError && (
              <div className="mb-md p-md bg-error/5 border border-error/20 rounded-lg text-body-md text-error">
                {docError}
              </div>
            )}

            <form className="grid grid-cols-1 md:grid-cols-3 gap-md items-end" onSubmit={handleUpload}>
              <div className="space-y-xs">
                <label className="block text-label-sm font-semibold text-secondary">Document type</label>
                <select
                  className="w-full border border-outline-variant rounded-lg text-body-md focus:ring-[#0D9488] focus:border-[#0D9488] p-2.5"
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                >
                  <option value="LICENSE">License</option>
                  <option value="INSURANCE">Insurance</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="space-y-xs">
                <label className="block text-label-sm font-semibold text-secondary">Upload file</label>
                <input
                  className="w-full border border-outline-variant rounded-lg text-body-md p-2.5"
                  type="file"
                  onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                />
              </div>

              <button
                className="bg-[#0D9488] text-white px-4 py-2 rounded-lg font-label-md hover:bg-opacity-90 transition-all disabled:opacity-60"
                type="submit"
                disabled={docUploading}
              >
                {docUploading ? 'Uploading...' : 'Upload'}
              </button>
            </form>

            <div className="mt-lg border border-outline-variant rounded-xl overflow-hidden">
              <div className="bg-surface-container-low px-md py-3 text-label-sm text-secondary font-semibold uppercase tracking-wider">
                Uploaded Documents
              </div>
              <div className="divide-y divide-outline-variant">
                {documents.map((d) => {
                  const sc = docStatusConfig[d.status] || docStatusConfig.PENDING;
                  return (
                    <div key={d.id} className="px-md py-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-sm">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-body-md font-semibold text-on-surface">{d.type}</span>
                          <span className={`${sc.bg} ${sc.text} px-2 py-1 rounded-full text-label-sm font-semibold border ${sc.border}`}>
                            {sc.label}
                          </span>
                        </div>
                        <div className="text-label-sm text-secondary mt-xs">
                          Uploaded {d.uploadedAt ? new Date(d.uploadedAt).toLocaleString() : '-'}
                        </div>
                        {d.status === 'REJECTED' && d.rejectionReason && (
                          <div className="text-label-sm text-error mt-xs">
                            {d.rejectionReason}
                          </div>
                        )}
                      </div>
                      <a
                        className="text-primary font-semibold text-label-md hover:underline"
                        href={`${API_BASE}${d.fileUrl}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View
                      </a>
                    </div>
                  );
                })}
                {documents.length === 0 && (
                  <div className="px-md py-lg text-body-md text-secondary">
                    No documents uploaded yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverProfile;
