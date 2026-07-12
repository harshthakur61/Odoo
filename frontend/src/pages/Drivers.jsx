import React, { useMemo, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_BASE = 'http://localhost:5000';

const mockDrivers = [
  { id: 1, name: 'Marcus Thorne', licenseNumber: 'DL-992341', licenseCategory: 'Class A CDL', licenseExpiry: '2023-10-12', contact: '+1 (555) 012-4432', safetyScore: 94, status: 'EXPIRED', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA0hqPeMFP3900ZfAKHNbnXhs4LmTijns48KYMfiNwnAIKoHlJXN2LmPhorhB3W9oLMjZu1sKrTetSH-6-V2ySoL-te7FJhnzD2bcZy5GePvqjpKHsQhrxgiotyGdgw3L2UZ26U1Tb8Xn_JtBVOfISOgMm7Nm_5cM2I3-7AcjL5OQnRC6ieOla12t66AILTyPZARncGLqZNHHzZZ2-_AD-jHh1GySNtPuTehNhmMwJz6JcONp5_taw' },
  { id: 2, name: 'Elena Rodriguez', licenseNumber: 'DL-772109', licenseCategory: 'Class B', licenseExpiry: '2025-06-14', contact: '+1 (555) 012-9981', safetyScore: 98, status: 'ACTIVE', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDcubanTGO4CjI9HhL5dmiNuhK6dxEiXiUBO_WOCnBEc-ZzC55uEAvN4w3dU8axkHts4m_8XAx9ez_yI-kJGlAjH7MoQcq-rLWI17NudmD-n6RLz2L_8zK998VcFn4uC0ad_zCE0vdHJCtCscKmDIMbGP-w70KOa2oE0gGTYn0pbQhed-TlnfMqiEd-VlaxidhzvW5vbFLRoSfNisGcg0cw-bSJrGY_Psmqnx1vOsbDgg_2WhNAWPs' },
  { id: 3, name: 'Jordan Smith', licenseNumber: 'DL-114402', licenseCategory: 'Class A CDL', licenseExpiry: '2024-12-02', contact: '+1 (555) 012-1123', safetyScore: 64, status: 'MONITORING', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCRRLmS6d8zgOKI2DEUy5s0piyfNbgP-jQUW3cjDnBix2tkLRpFJGPh4JxgxxBEVl_JGxIZZrymixAvKtH2_jFuaj3dJpRsUpZQ1qHzKkc_rmDmLod2X13mhHGbxeJGYT3Xp0SVzc9O3x7yKBEvDTNiH1PWgymTJYCUClYaSuCNhSMEFbooIOzLxQKTB1G6f_47dIW1Fs5IMD8IgWIwYnNKcioeyBQp0PIdBzJ5T2ppbXnSqUwHcoU' },
  { id: 4, name: 'Thomas Chen', licenseNumber: 'DL-552199', licenseCategory: 'Class B', licenseExpiry: '2025-03-20', contact: '+1 (555) 012-7766', safetyScore: 82, status: 'ACTIVE', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAqJPe4tmexMNFXpvKBYNnOcaEUmHFkP2D4n56qeuCaYinPKpIk-mSz-1UwD7KYY_Vdc-SoU7Kp_cATsD6WNbUPSmZeC5t1M8JxwRdPzcZWwBADMh3euQDtpLLUI34udv7SFrqX2MikFXkFul7ggaY10Jk505sy9MqPN0oANhDvE-4jvoh3BRs8OyFESSBgwjycqCuMmPTpDsBmY-SD4r1JKWAOXmiNMV98aixd0ar0cv0814C3PIA' },
  { id: 5, name: 'Sarah Jenkins', licenseNumber: 'DL-001283', licenseCategory: 'Class A CDL', licenseExpiry: '2024-11-11', contact: '+1 (555) 012-0033', safetyScore: 91, status: 'ACTIVE', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBI0C3azOGqBf3Ec0nP5GBM-BobfQzjGzp0DFHB11Q9w2s_Gyo1T6ErhFjfUYpSYYTmzws-o1U3GSED-OmuvtVTCOA3GSosKTQX5avLAZHsS-vJ2b22WZfuNjmrfqhBPP3wiaknfQBtlicHB7x6RmssSKXt5mtuccDewAdhITSvVKdZFdp1AragTaJvZKO3kGQE_RhKS1xvAWJPvVy0H6wwgewJ9wP67aEhKkGYozrTbS0pn_FfenM' },
  { id: 6, name: 'David Okafor', licenseNumber: 'DL-883341', licenseCategory: 'Class B', licenseExpiry: '2025-01-30', contact: '+1 (555) 012-5544', safetyScore: 88, status: 'ON_LEAVE', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCmMxGdOnEzc33GrKI29esOZ7o-pTDidn1r9jNGrppt5JorzL75Sa62tc6pom2c8u0k--49-71Oq6yWtjgvMzZ47j0Hb9oyOhHqD6LQGtKbc4mBViRbd7LOVPufb6TAjJBq-1V9gdoxXs94N3A_IRHoselTVNB-oKA3fK95YmfzkVYQUyGOuqGWvYeBeiTw1NTnzt_GNJ5XtnzmrQsO8PaaD4OTsLVHEWR-bhBE4uJDnYOKkFimDC0' },
];

const statusConfig = {
  ACTIVE: { label: 'Active', bg: 'bg-[#0D9488]/10', text: 'text-[#0D9488]', border: 'border-[#0D9488]/20' },
  EXPIRED: { label: 'Expired', bg: 'bg-error/10', text: 'text-error', border: 'border-error/20' },
  MONITORING: { label: 'Monitoring', bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
  ON_LEAVE: { label: 'On leave', bg: 'bg-surface-container', text: 'text-secondary', border: 'border-outline-variant' },
  ON_TRIP: { label: 'On Trip', bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  INACTIVE: { label: 'Inactive', bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' },
};

const getDaysRemaining = (dateStr) => {
  const expiry = new Date(dateStr);
  const today = new Date();
  const diff = Math.floor((expiry - today) / (1000 * 60 * 60 * 24));
  return diff;
};

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const emptyDriver = { name: '', licenseNumber: '', licenseCategory: 'Class A CDL', licenseExpiry: '', contact: '', safetyScore: 85, status: 'ACTIVE' };

const Drivers = () => {
  const { hasRole } = useAuth();
  const [drivers, setDrivers] = useState(mockDrivers);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [newDriver, setNewDriver] = useState({ ...emptyDriver });
  const [reviewDriver, setReviewDriver] = useState(null);
  const [reviewDocs, setReviewDocs] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [rejectDocId, setRejectDocId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const docStatusConfig = useMemo(() => ({
    PENDING: { label: 'Pending', bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
    VERIFIED: { label: 'Verified', bg: 'bg-[#0D9488]/10', text: 'text-[#0D9488]', border: 'border-[#0D9488]/20' },
    REJECTED: { label: 'Rejected', bg: 'bg-error/10', text: 'text-error', border: 'border-error/20' },
    EXPIRED: { label: 'Expired', bg: 'bg-error/10', text: 'text-error', border: 'border-error/20' },
  }), []);

  const loadDriverDocs = async (driverId) => {
    try {
      setReviewLoading(true);
      setReviewError('');
      const res = await axios.get(`${API_BASE}/api/documents/driver/${driverId}`);
      setReviewDocs(res.data || []);
    } catch (e) {
      setReviewError(e.response?.data?.error || 'Failed to load documents');
      setReviewDocs([]);
    } finally {
      setReviewLoading(false);
    }
  };

  const openReview = async (driver) => {
    setReviewDriver(driver);
    setRejectDocId(null);
    setRejectReason('');
    await loadDriverDocs(driver.id);
  };

  const closeReview = () => {
    setReviewDriver(null);
    setReviewDocs([]);
    setReviewError('');
    setRejectDocId(null);
    setRejectReason('');
  };

  const verifyDoc = async (docId) => {
    try {
      await axios.put(`${API_BASE}/api/documents/${docId}/verify`);
      if (reviewDriver) await loadDriverDocs(reviewDriver.id);
    } catch (e) {
      setReviewError(e.response?.data?.error || 'Failed to verify document');
    }
  };

  const rejectDoc = async () => {
    if (!rejectDocId) return;
    const reason = rejectReason.trim();
    if (!reason) {
      setReviewError('Rejection reason is required');
      return;
    }
    try {
      await axios.put(`${API_BASE}/api/documents/${rejectDocId}/reject`, { rejectionReason: reason });
      setRejectDocId(null);
      setRejectReason('');
      if (reviewDriver) await loadDriverDocs(reviewDriver.id);
    } catch (e) {
      setReviewError(e.response?.data?.error || 'Failed to reject document');
    }
  };

  const filteredDrivers = drivers.filter(d => {
    if (statusFilter !== 'all' && d.status !== statusFilter) return false;
    return true;
  });

  const handleAddDriver = (e) => {
    e.preventDefault();
    setDrivers(prev => [...prev, { ...newDriver, id: Date.now(), safetyScore: Number(newDriver.safetyScore) }]);
    setNewDriver({ ...emptyDriver });
    setShowModal(false);
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-primary';
    if (score >= 75) return 'text-amber-600';
    return 'text-error';
  };

  return (
    <>
      {/* Header & Toolbar */}
      <div className="flex justify-between items-end mb-lg">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Drivers</h2>
          <p className="text-body-md text-secondary">Manage and monitor fleet personnel status and compliance.</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="border border-outline-variant rounded-lg text-body-md focus:ring-[#0D9488] focus:border-[#0D9488] min-w-[160px] px-md py-2"
          >
            <option value="all">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="ON_LEAVE">On leave</option>
            <option value="EXPIRED">Expired license</option>
          </select>
          <button
            onClick={() => setShowModal(true)}
            className="bg-[#0D9488] text-white px-4 py-2 rounded-lg flex items-center gap-2 font-label-md hover:bg-opacity-90 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add driver
          </button>
        </div>
      </div>

      {/* Drivers Table Card */}
      <div className="bg-white border border-outline-variant rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                <th className="px-md py-4 text-label-sm text-secondary font-semibold uppercase tracking-wider">Name</th>
                <th className="px-md py-4 text-label-sm text-secondary font-semibold uppercase tracking-wider">License#</th>
                <th className="px-md py-4 text-label-sm text-secondary font-semibold uppercase tracking-wider">Category</th>
                <th className="px-md py-4 text-label-sm text-secondary font-semibold uppercase tracking-wider">Expiry</th>
                <th className="px-md py-4 text-label-sm text-secondary font-semibold uppercase tracking-wider">Contact</th>
                <th className="px-md py-4 text-label-sm text-secondary font-semibold uppercase tracking-wider text-center">Safety score</th>
                <th className="px-md py-4 text-label-sm text-secondary font-semibold uppercase tracking-wider">Status</th>
                <th className="px-md py-4 text-label-sm text-secondary font-semibold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {filteredDrivers.map(driver => {
                const sc = statusConfig[driver.status] || statusConfig.ACTIVE;
                const days = getDaysRemaining(driver.licenseExpiry);
                const isExpired = days < 0;
                return (
                  <tr
                    key={driver.id}
                    className={`hover:bg-surface-container-high transition-colors cursor-pointer ${isExpired ? 'bg-red-50/30' : ''}`}
                  >
                    <td className="px-md py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 border border-outline-variant overflow-hidden flex-shrink-0">
                          <img className="w-full h-full object-cover" src={driver.avatar} alt={driver.name} />
                        </div>
                        <span className="font-body-md font-semibold text-on-surface">{driver.name}</span>
                      </div>
                    </td>
                    <td className="px-md py-4 font-body-md text-secondary">{driver.licenseNumber}</td>
                    <td className="px-md py-4">
                      <span className="bg-surface-container border border-outline-variant px-2 py-0.5 rounded text-label-sm text-secondary">{driver.licenseCategory}</span>
                    </td>
                    <td className="px-md py-4">
                      <div className={`text-body-md font-medium ${isExpired ? 'text-error font-semibold' : 'text-on-surface'}`}>
                        {formatDate(driver.licenseExpiry)}
                      </div>
                      <div className={`text-label-sm ${isExpired ? 'text-error/80' : 'text-secondary'}`}>
                        {isExpired ? 'Expired' : `${days} days remaining`}
                      </div>
                    </td>
                    <td className="px-md py-4 font-body-md text-secondary">{driver.contact}</td>
                    <td className={`px-md py-4 text-center font-bold text-headline-md ${getScoreColor(driver.safetyScore)}`}>{driver.safetyScore}</td>
                    <td className="px-md py-4">
                      <span className={`${sc.bg} ${sc.text} px-2 py-1 rounded-full text-label-sm font-semibold border ${sc.border}`}>
                        {sc.label}
                      </span>
                    </td>
                    <td className="px-md py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {hasRole('Fleet Manager') && (
                          <button
                            className="px-3 py-1 border border-outline-variant rounded hover:bg-surface-container transition-colors text-label-md"
                            onClick={(e) => { e.stopPropagation(); openReview(driver); }}
                            type="button"
                          >
                            Review Docs
                          </button>
                        )}
                        <button className="material-symbols-outlined text-secondary hover:text-error transition-colors p-1" title="Suspend" type="button">block</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredDrivers.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-md py-xl text-center text-outline">No drivers match your filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-md py-4 border-t border-outline-variant bg-surface-container-lowest flex items-center justify-between">
          <span className="text-body-md text-secondary">Showing {filteredDrivers.length} of {drivers.length} drivers</span>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 border border-outline-variant rounded hover:bg-surface-container transition-colors text-label-md">Previous</button>
            <button className="px-3 py-1 border border-[#0D9488] bg-[#0D9488] text-white rounded text-label-md">1</button>
            <button className="px-3 py-1 border border-outline-variant rounded hover:bg-surface-container transition-colors text-label-md">2</button>
            <button className="px-3 py-1 border border-outline-variant rounded hover:bg-surface-container transition-colors text-label-md">3</button>
            <button className="px-3 py-1 border border-outline-variant rounded hover:bg-surface-container transition-colors text-label-md">Next</button>
          </div>
        </div>
      </div>

      {/* Add Driver Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="bg-white rounded-lg border border-outline-variant w-full max-w-2xl relative">
            <div className="px-lg py-md border-b border-outline-variant flex justify-between items-center">
              <h3 className="font-headline-md text-headline-md">Add new driver</h3>
              <button className="material-symbols-outlined text-secondary hover:text-on-surface" onClick={() => setShowModal(false)}>close</button>
            </div>
            <form className="p-lg" onSubmit={handleAddDriver}>
              <div className="grid grid-cols-2 gap-lg">
                <div className="space-y-md">
                  <div>
                    <label className="block text-label-sm font-semibold text-secondary mb-1">Full name</label>
                    <input className="w-full border border-outline-variant rounded-lg text-body-md focus:ring-[#0D9488] focus:border-[#0D9488] p-2.5" placeholder="e.g. Marcus Thorne" type="text" value={newDriver.name} onChange={e => setNewDriver(p => ({ ...p, name: e.target.value }))} required />
                  </div>
                  <div>
                    <label className="block text-label-sm font-semibold text-secondary mb-1">License number</label>
                    <input className="w-full border border-outline-variant rounded-lg text-body-md focus:ring-[#0D9488] focus:border-[#0D9488] p-2.5" placeholder="DL-000000" type="text" value={newDriver.licenseNumber} onChange={e => setNewDriver(p => ({ ...p, licenseNumber: e.target.value }))} required />
                  </div>
                  <div>
                    <label className="block text-label-sm font-semibold text-secondary mb-1">Category</label>
                    <select className="w-full border border-outline-variant rounded-lg text-body-md focus:ring-[#0D9488] focus:border-[#0D9488] p-2.5" value={newDriver.licenseCategory} onChange={e => setNewDriver(p => ({ ...p, licenseCategory: e.target.value }))}>
                      <option>Class A CDL</option>
                      <option>Class B</option>
                      <option>Class C</option>
                      <option>Hazmat Certified</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-md">
                  <div>
                    <label className="block text-label-sm font-semibold text-secondary mb-1">Contact number</label>
                    <input className="w-full border border-outline-variant rounded-lg text-body-md focus:ring-[#0D9488] focus:border-[#0D9488] p-2.5" placeholder="+1 (000) 000-0000" type="tel" value={newDriver.contact} onChange={e => setNewDriver(p => ({ ...p, contact: e.target.value }))} required />
                  </div>
                  <div>
                    <label className="block text-label-sm font-semibold text-secondary mb-1">License expiry date</label>
                    <input className="w-full border border-outline-variant rounded-lg text-body-md focus:ring-[#0D9488] focus:border-[#0D9488] p-2.5" type="date" value={newDriver.licenseExpiry} onChange={e => setNewDriver(p => ({ ...p, licenseExpiry: e.target.value }))} required />
                  </div>
                  <div className="flex gap-md">
                    <div className="flex-1">
                      <label className="block text-label-sm font-semibold text-secondary mb-1">Safety score</label>
                      <input className="w-full border border-outline-variant rounded-lg text-body-md focus:ring-[#0D9488] focus:border-[#0D9488] p-2.5" min="0" max="100" placeholder="0-100" type="number" value={newDriver.safetyScore} onChange={e => setNewDriver(p => ({ ...p, safetyScore: e.target.value }))} />
                    </div>
                    <div className="flex-1">
                      <label className="block text-label-sm font-semibold text-secondary mb-1">Initial status</label>
                      <select className="w-full border border-outline-variant rounded-lg text-body-md focus:ring-[#0D9488] focus:border-[#0D9488] p-2.5" value={newDriver.status} onChange={e => setNewDriver(p => ({ ...p, status: e.target.value }))}>
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                        <option value="ON_LEAVE">On leave</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-xl pt-lg border-t border-outline-variant flex justify-end gap-md">
                <button className="px-6 py-2 border border-outline-variant text-on-surface hover:bg-surface-container rounded-lg text-label-md transition-colors" onClick={() => setShowModal(false)} type="button">Cancel</button>
                <button className="px-6 py-2 bg-[#0D9488] text-white font-semibold rounded-lg text-label-md hover:bg-opacity-90 transition-all shadow-sm" type="submit">Create driver profile</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {reviewDriver && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-md">
          <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" onClick={closeReview}></div>
          <div className="bg-white rounded-lg border border-outline-variant w-full max-w-3xl relative overflow-hidden">
            <div className="px-lg py-md border-b border-outline-variant flex justify-between items-center">
              <div>
                <h3 className="font-headline-md text-headline-md">Review Documents</h3>
                <p className="text-body-md text-secondary mt-1">{reviewDriver.name}</p>
              </div>
              <button className="material-symbols-outlined text-secondary hover:text-on-surface" onClick={closeReview} type="button">close</button>
            </div>

            <div className="p-lg space-y-md">
              {reviewError && (
                <div className="p-md bg-error/5 border border-error/20 rounded-lg text-body-md text-error">
                  {reviewError}
                </div>
              )}

              {reviewLoading ? (
                <div className="text-body-md text-secondary">Loading documents...</div>
              ) : (
                <div className="border border-outline-variant rounded-lg overflow-hidden">
                  <div className="bg-surface-container-low px-md py-3 text-label-sm text-secondary font-semibold uppercase tracking-wider">
                    Uploaded Documents
                  </div>
                  <div className="divide-y divide-outline-variant">
                    {reviewDocs.map((d) => {
                      const sc = docStatusConfig[d.status] || docStatusConfig.PENDING;
                      return (
                        <div key={d.id} className="px-md py-md flex flex-col md:flex-row md:items-center md:justify-between gap-md">
                          <div className="min-w-0">
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className="font-body-md font-semibold text-on-surface">{d.type}</span>
                              <span className={`${sc.bg} ${sc.text} px-2 py-1 rounded-full text-label-sm font-semibold border ${sc.border}`}>
                                {sc.label}
                              </span>
                              <a
                                className="text-primary font-semibold text-label-md hover:underline"
                                href={`${API_BASE}${d.fileUrl}`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                Preview
                              </a>
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

                          <div className="flex items-center gap-2 justify-end">
                            <button
                              className="px-3 py-1 rounded border border-[#0D9488]/30 text-[#0D9488] hover:bg-[#0D9488]/10 transition-colors text-label-md font-semibold"
                              onClick={() => verifyDoc(d.id)}
                              type="button"
                            >
                              Verify
                            </button>
                            <button
                              className="px-3 py-1 rounded border border-error/30 text-error hover:bg-error/10 transition-colors text-label-md font-semibold"
                              onClick={() => { setRejectDocId(d.id); setRejectReason(''); setReviewError(''); }}
                              type="button"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    {reviewDocs.length === 0 && (
                      <div className="px-md py-lg text-body-md text-secondary">
                        No documents uploaded yet.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {rejectDocId && (
                <div className="border border-outline-variant rounded-lg p-md">
                  <div className="flex items-center justify-between gap-md">
                    <div className="font-body-md font-semibold text-on-surface">Reject reason</div>
                    <button className="material-symbols-outlined text-secondary hover:text-on-surface" onClick={() => { setRejectDocId(null); setRejectReason(''); }} type="button">close</button>
                  </div>
                  <div className="mt-sm grid grid-cols-1 md:grid-cols-4 gap-md items-end">
                    <div className="md:col-span-3">
                      <input
                        className="w-full border border-outline-variant rounded-lg text-body-md focus:ring-[#0D9488] focus:border-[#0D9488] p-2.5"
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
    </>
  );
};

export default Drivers;
