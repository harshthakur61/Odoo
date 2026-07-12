import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API_BASE = 'http://localhost:5000';

const DriverDashboard = () => {
  const { user } = useAuth();
  const [activeTrip, setActiveTrip] = useState(null);
  const [note, setNote] = useState('');
  const [noteError, setNoteError] = useState('');
  const [noteSending, setNoteSending] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueDesc, setIssueDesc] = useState('');
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [emergencyDesc, setEmergencyDesc] = useState('');
  const [emergencySending, setEmergencySending] = useState(false);

  const handleReportIssue = (e) => {
    e.preventDefault();
    alert(`Issue reported: ${issueDesc}`);
    setShowIssueModal(false);
    setIssueDesc('');
  };

  const handleSendEmergency = async (e) => {
    e.preventDefault();
    if (!activeTrip) return;
    try {
      setEmergencySending(true);
      await axios.post(`${API_BASE}/api/emergency-reports`, {
        tripId: activeTrip.id,
        message: emergencyDesc,
      });
      alert('Emergency report sent successfully!');
      setShowEmergencyModal(false);
      setEmergencyDesc('');
    } catch (e) {
      alert('Failed to send emergency report: ' + (e.response?.data?.error || 'Unknown error'));
    } finally {
      setEmergencySending(false);
    }
  };

  useEffect(() => {
    if (user?.role !== 'Driver') return;
    (async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/trips`);
        const trips = res.data || [];
        const dispatched = trips.find((t) => t.status === 'DISPATCHED') || null;
        setActiveTrip(dispatched);
      } catch (e) {
        setActiveTrip(null);
      }
    })();
  }, [user?.role]);

  const postNote = async () => {
    if (!activeTrip) return;
    const msg = note.trim();
    if (!msg) return;
    try {
      setNoteSending(true);
      setNoteError('');
      await axios.post(`${API_BASE}/api/trips/${activeTrip.id}/events`, { message: msg });
      setNote('');
    } catch (e) {
      setNoteError(e.response?.data?.error || 'Failed to post note');
    } finally {
      setNoteSending(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-lg">
      {user?.role === 'Driver' && (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-lg shadow-sm">
          <div className="flex items-start justify-between gap-md">
            <div>
              <h3 className="font-headline-md text-headline-md font-bold text-on-surface">Driver Updates</h3>
              <p className="text-body-md text-secondary mt-1">Post real-time notes to the dispatcher timeline for your dispatched trip.</p>
            </div>
            {activeTrip && (
              <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-label-sm font-bold border border-primary/20">
                TRP-{String(activeTrip.id).padStart(4, '0')}
              </div>
            )}
          </div>

          {!activeTrip ? (
            <div className="mt-md text-body-md text-secondary">No dispatched trips found for your account.</div>
          ) : (
            <div className="mt-md">
              {noteError && (
                <div className="mb-md p-md bg-error/5 border border-error/20 rounded-lg text-body-md text-error">
                  {noteError}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  className="flex-1 border border-outline-variant rounded-lg p-2.5 text-body-md"
                  placeholder="e.g. Delayed by traffic, reached checkpoint, etc."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
                <button
                  className="bg-primary text-white px-4 py-2 rounded-lg font-label-md hover:brightness-110 disabled:opacity-60"
                  type="button"
                  onClick={postNote}
                  disabled={noteSending || !note.trim()}
                >
                  {noteSending ? 'Sending...' : 'Send'}
                </button>
              </div>

              <div className="mt-lg space-y-md">
                <div className="p-md bg-surface-container border border-outline-variant rounded-lg">
                  <h4 className="font-headline-sm text-headline-sm text-on-surface mb-md">Trip Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                    <div>
                      <p className="text-label-sm text-secondary">Vehicle</p>
                      <p className="text-body-md text-on-surface">{activeTrip.vehicle?.regNumber || '-'}</p>
                    </div>
                    <div>
                      <p className="text-label-sm text-secondary">Route</p>
                      <p className="text-body-md text-on-surface">{activeTrip.source} → {activeTrip.destination}</p>
                    </div>
                    <div>
                      <p className="text-label-sm text-secondary">Cargo Weight</p>
                      <p className="text-body-md text-on-surface">{activeTrip.cargoWeight} kg</p>
                    </div>
                    <div>
                      <p className="text-label-sm text-secondary">Planned Distance</p>
                      <p className="text-body-md text-on-surface">{activeTrip.plannedDistance} km</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Floating Buttons — shown when there is an active trip */}
      {activeTrip && (
        <div className="fixed bottom-6 right-6 z-20 space-y-3">
          <button
            onClick={() => setShowEmergencyModal(true)}
            className="w-16 h-16 bg-red-600 text-white rounded-full shadow-xl flex items-center justify-center hover:bg-red-700 active:scale-95 transition-all border-2 border-red-200 animate-pulse"
            title="Emergency Report"
          >
            <span className="material-symbols-outlined text-[32px]">emergency</span>
          </button>
          <button
            onClick={() => setShowIssueModal(true)}
            className="w-12 h-12 bg-orange-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-orange-600 active:scale-95 transition-all"
            title="Report Issue"
          >
            <span className="material-symbols-outlined text-[24px]">report_problem</span>
          </button>
        </div>
      )}

      {/* Issue Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-xl border border-outline-variant shadow-2xl">
            <div className="p-lg border-b border-outline-variant flex justify-between items-center">
              <h3 className="font-headline-md text-headline-md font-bold text-error flex items-center gap-2">
                <span className="material-symbols-outlined">warning</span>
                Report an Issue
              </h3>
              <button onClick={() => setShowIssueModal(false)} className="text-secondary hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleReportIssue} className="p-lg space-y-md">
              <div>
                <label className="block text-label-sm font-bold text-secondary mb-2">Reason / Type</label>
                <select className="w-full border border-outline-variant rounded-lg p-3 text-body-md focus:border-error outline-none" required>
                  <option value="">Select reason...</option>
                  <option value="breakdown">Vehicle Breakdown</option>
                  <option value="traffic">Severe Traffic / Delay</option>
                  <option value="accident">Accident</option>
                  <option value="cargo">Cargo Issue</option>
                  <option value="weather">Weather Conditions</option>
                </select>
              </div>
              <div>
                <label className="block text-label-sm font-bold text-secondary mb-2">Details</label>
                <textarea
                  className="w-full border border-outline-variant rounded-lg p-3 text-body-md focus:border-error outline-none min-h-[100px]"
                  placeholder="Provide details..."
                  value={issueDesc}
                  onChange={(e) => setIssueDesc(e.target.value)}
                  required
                />
              </div>
              <div className="pt-md border-t border-outline-variant">
                <button type="submit" className="w-full bg-error text-white py-3 rounded-lg font-bold text-label-md hover:bg-red-700 active:scale-95 transition-all shadow-md">
                  Submit Report to Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Emergency Report Modal */}
      {showEmergencyModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-xl border-2 border-red-500 shadow-2xl">
            <div className="p-lg border-b border-outline-variant flex justify-between items-center bg-red-50">
              <h3 className="font-headline-md text-headline-md font-bold text-red-600 flex items-center gap-2">
                <span className="material-symbols-outlined">emergency</span>
                Report Emergency
              </h3>
              <button onClick={() => setShowEmergencyModal(false)} className="text-secondary hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSendEmergency} className="p-lg space-y-md">
              <div>
                <label className="block text-label-sm font-bold text-red-600 mb-2">Emergency Details</label>
                <textarea
                  className="w-full border border-red-300 rounded-lg p-3 text-body-md focus:border-red-500 outline-none min-h-[150px]"
                  placeholder="Describe the emergency in detail..."
                  value={emergencyDesc}
                  onChange={(e) => setEmergencyDesc(e.target.value)}
                  required
                />
              </div>
              <div className="pt-md border-t border-outline-variant">
                <button
                  type="submit"
                  className="w-full bg-red-600 text-white py-3 rounded-lg font-bold text-label-md hover:bg-red-700 active:scale-95 transition-all shadow-md disabled:opacity-60"
                  disabled={emergencySending}
                >
                  {emergencySending ? 'Sending...' : 'Send Emergency Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverDashboard;
