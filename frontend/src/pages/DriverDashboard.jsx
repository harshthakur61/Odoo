import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API_BASE = 'http://localhost:5000';

const tripFlow = [
  'Assigned',
  'Accepted',
  'On the Way to Pickup',
  'Picked Up',
  'On the Way to Delivery',
  'Arrived',
  'Completed',
  'Trip Closed'
];

const mockTrip = {
  id: 'TRP-9042',
  vehicle: 'Ford Transit (VAN-042)',
  source: 'Depot A (Chicago)',
  destination: 'Local Retail H3',
  cargo: '2,100 kg - Electronics',
  pickupTime: 'Today, 14:00',
  contact: '+1 (555) 019-2831',
};

const DriverDashboard = () => {
  const { user } = useAuth();
  const [activeTrip, setActiveTrip] = useState(null);
  const [note, setNote] = useState('');
  const [noteError, setNoteError] = useState('');
  const [noteSending, setNoteSending] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueDesc, setIssueDesc] = useState('');
  const [timestamps, setTimestamps] = useState({ 0: new Date().toLocaleString() });

  const status = tripFlow[currentStepIndex];
  const isDeclined = currentStepIndex >= tripFlow.length;

  const advanceTrip = () => {
    if (currentStepIndex < tripFlow.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      setTimestamps(prev => ({ ...prev, [nextIndex]: new Date().toLocaleString() }));
    }
  };

  const handleReportIssue = (e) => {
    e.preventDefault();
    alert(`Issue reported: ${issueDesc}`);
    setShowIssueModal(false);
    setIssueDesc('');
  };

  const handleDecline = (e) => {
    e.preventDefault();
    alert(`Trip Declined. Reason: ${issueDesc}`);
    setShowIssueModal(false);
    setIssueDesc('');
    setCurrentStepIndex(tripFlow.length); // sentinel for "declined"
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
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
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
            </div>
          )}
        </div>
      )}

      {/* No Active Trip */}
      {(isDeclined || status === 'Trip Closed') ? (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-xl text-center shadow-sm">
          <span className="material-symbols-outlined text-primary text-[48px] mb-4 block">task_alt</span>
          <h2 className="font-headline-md text-headline-md font-bold text-on-surface mb-2">
            {isDeclined ? 'Trip Declined' : 'Trip Completed'}
          </h2>
          <p className="text-body-md text-secondary">
            You currently have no active assignments. The dispatcher will notify you when a new trip is assigned.
          </p>
        </div>
      ) : (
        <>
          {/* Active Trip Card */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
            <div className="p-md bg-surface-container-low border-b border-outline-variant flex justify-between items-center">
              <div>
                <span className="text-label-sm text-secondary uppercase tracking-wider font-bold">Active Trip</span>
                <h2 className="font-headline-md text-headline-md font-bold text-primary">{mockTrip.id}</h2>
              </div>
              <span className="px-3 py-1 bg-primary-container text-on-primary-container rounded-full text-label-sm font-bold">
                {status}
              </span>
            </div>

            <div className="p-md space-y-md">
              {/* Progress Bar */}
              <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500 ease-out"
                  style={{ width: `${(currentStepIndex / (tripFlow.length - 2)) * 100}%` }}
                />
              </div>

              {/* Trip Details */}
              <div className="space-y-sm">
                <div className="flex gap-3">
                  <span className="material-symbols-outlined text-secondary">local_shipping</span>
                  <div>
                    <p className="text-label-sm text-secondary">Vehicle</p>
                    <p className="font-body-md font-medium text-on-surface">{mockTrip.vehicle}</p>
                  </div>
                </div>

                <div className="flex gap-3 pt-sm border-t border-outline-variant">
                  <span className="material-symbols-outlined text-secondary">my_location</span>
                  <div>
                    <p className="text-label-sm text-secondary">Pickup Location</p>
                    <p className="font-body-md font-medium text-on-surface">{mockTrip.source}</p>
                    <p className="text-label-sm text-secondary mt-1">Scheduled: {mockTrip.pickupTime}</p>
                  </div>
                </div>

                <div className="flex gap-3 pt-sm border-t border-outline-variant">
                  <span className="material-symbols-outlined text-secondary">pin_drop</span>
                  <div>
                    <p className="text-label-sm text-secondary">Destination</p>
                    <p className="font-body-md font-medium text-on-surface">{mockTrip.destination}</p>
                  </div>
                </div>

                <div className="flex gap-3 pt-sm border-t border-outline-variant">
                  <span className="material-symbols-outlined text-secondary">inventory_2</span>
                  <div>
                    <p className="text-label-sm text-secondary">Cargo Details</p>
                    <p className="font-body-md font-medium text-on-surface">{mockTrip.cargo}</p>
                  </div>
                </div>

                <div className="flex gap-3 pt-sm border-t border-outline-variant">
                  <span className="material-symbols-outlined text-secondary">history</span>
                  <div className="w-full">
                    <p className="text-label-sm text-secondary mb-2">Trip Timeline</p>
                    <div className="space-y-2">
                      {tripFlow.map((step, index) => {
                        if (!timestamps[index]) return null;
                        return (
                          <div key={step} className="flex justify-between items-center text-sm">
                            <span className={`font-medium ${index === currentStepIndex ? 'text-primary' : 'text-on-surface'}`}>
                              {step}
                            </span>
                            <span className="text-secondary text-xs">{timestamps[index]}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Area */}
          {status !== 'Trip Closed' && (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm space-y-md">
              <p className="text-label-sm text-secondary uppercase tracking-wider font-bold">Next Action Required</p>

              {status === 'Assigned' && (
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowIssueModal(true)}
                    className="flex-1 border border-error text-error py-4 rounded-lg font-label-md font-bold text-[16px] hover:bg-error-container active:scale-95 transition-all"
                  >
                    Decline
                  </button>
                  <button
                    onClick={advanceTrip}
                    className="flex-[2] bg-primary text-white py-4 rounded-lg font-label-md font-bold text-[16px] hover:opacity-90 active:scale-95 transition-all shadow-md"
                  >
                    Accept Trip Assignment
                  </button>
                </div>
              )}

              {status === 'Accepted' && (
                <button onClick={advanceTrip} className="w-full bg-primary text-white py-4 rounded-lg font-label-md font-bold text-[16px] hover:opacity-90 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined">navigation</span>
                  Start Travel to Pickup
                </button>
              )}

              {status === 'On the Way to Pickup' && (
                <button onClick={advanceTrip} className="w-full bg-[#0D9488] text-white py-4 rounded-lg font-label-md font-bold text-[16px] hover:opacity-90 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined">how_to_reg</span>
                  Confirm Arrival at Pickup
                </button>
              )}

              {status === 'Picked Up' && (
                <button onClick={advanceTrip} className="w-full bg-primary text-white py-4 rounded-lg font-label-md font-bold text-[16px] hover:opacity-90 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined">local_shipping</span>
                  Start Travel to Delivery
                </button>
              )}

              {status === 'On the Way to Delivery' && (
                <button onClick={advanceTrip} className="w-full bg-[#0D9488] text-white py-4 rounded-lg font-label-md font-bold text-[16px] hover:opacity-90 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined">location_on</span>
                  Confirm Arrival at Destination
                </button>
              )}

              {status === 'Arrived' && (
                <button onClick={advanceTrip} className="w-full bg-primary text-white py-4 rounded-lg font-label-md font-bold text-[16px] hover:opacity-90 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined">done_all</span>
                  Complete Delivery &amp; Upload Proof
                </button>
              )}

              {status === 'Completed' && (
                <div className="text-center p-md bg-green-50 rounded-lg border border-green-200">
                  <p className="text-green-800 font-bold mb-2">Delivery Completed Successfully!</p>
                  <p className="text-sm text-green-700">Waiting for dispatcher to close the trip...</p>
                  <button onClick={advanceTrip} className="mt-4 text-sm underline text-green-800">
                    (Mock Dispatcher Close)
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Floating Report Issue Button — shown during active stages except Assigned */}
          {status !== 'Completed' && status !== 'Trip Closed' && status !== 'Assigned' && (
            <div className="fixed bottom-6 right-6 z-20">
              <button
                onClick={() => setShowIssueModal(true)}
                className="w-14 h-14 bg-error text-white rounded-full shadow-lg flex items-center justify-center hover:bg-red-700 active:scale-95 transition-all"
                title="Report Issue"
              >
                <span className="material-symbols-outlined text-[28px]">report_problem</span>
              </button>
            </div>
          )}
        </>
      )}

      {/* Issue / Decline Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-xl border border-outline-variant shadow-2xl">
            <div className="p-lg border-b border-outline-variant flex justify-between items-center">
              <h3 className="font-headline-md text-headline-md font-bold text-error flex items-center gap-2">
                <span className="material-symbols-outlined">warning</span>
                {status === 'Assigned' ? 'Decline Trip' : 'Report an Issue'}
              </h3>
              <button onClick={() => setShowIssueModal(false)} className="text-secondary hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={status === 'Assigned' ? handleDecline : handleReportIssue} className="p-lg space-y-md">
              <div>
                <label className="block text-label-sm font-bold text-secondary mb-2">Reason / Type</label>
                <select className="w-full border border-outline-variant rounded-lg p-3 text-body-md focus:border-error outline-none" required>
                  <option value="">Select reason...</option>
                  {status === 'Assigned' ? (
                    <>
                      <option value="breakdown">Vehicle Breakdown</option>
                      <option value="hours">Out of Hours</option>
                      <option value="emergency">Personal Emergency</option>
                      <option value="other">Other</option>
                    </>
                  ) : (
                    <>
                      <option value="breakdown">Vehicle Breakdown</option>
                      <option value="traffic">Severe Traffic / Delay</option>
                      <option value="accident">Accident</option>
                      <option value="cargo">Cargo Issue</option>
                      <option value="weather">Weather Conditions</option>
                    </>
                  )}
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
                  {status === 'Assigned' ? 'Confirm Decline' : 'Submit Report to Dispatch'}
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
