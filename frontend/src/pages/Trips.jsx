import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_BASE = 'http://localhost:5000';

const statusStyles = {
  DISPATCHED: 'bg-blue-100 text-blue-800',
  DRAFT: 'bg-gray-200 text-gray-700',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const Trips = () => {
  const { user, hasRole } = useAuth();
  const [trips, setTrips] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [timelineTrip, setTimelineTrip] = useState(null);
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [timelineError, setTimelineError] = useState('');
  const [newNote, setNewNote] = useState('');

  const [newTrip, setNewTrip] = useState({ vehicleId: '', driverId: '', cargoWeight: '', source: '', destination: '', plannedDistance: '' });

  const formatTripId = (id) => `TRP-${String(id).padStart(4, '0')}`;

  const formatDateTime = (v) => {
    if (!v) return '-';
    return new Date(v).toLocaleString();
  };

  const loadTrips = async () => {
    const res = await axios.get(`${API_BASE}/api/trips`);
    setTrips(res.data || []);
  };

  const loadDrivers = async () => {
    const res = await axios.get(`${API_BASE}/api/drivers`);
    setDrivers(res.data || []);
  };

  const loadVehicles = async () => {
    const res = await axios.get(`${API_BASE}/api/vehicles`);
    setVehicles(res.data || []);
  };

  const refresh = async () => {
    try {
      setLoading(true);
      setError('');
      await loadTrips();
      if (hasRole(['Dispatcher', 'Fleet Manager'])) {
        await Promise.all([loadDrivers(), loadVehicles()]);
      }
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to load trips');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) refresh();
  }, [user?.role]);

  const availableDrivers = useMemo(() => {
    return drivers.filter((d) => d.status === 'AVAILABLE');
  }, [drivers]);

  const availableVehicles = useMemo(() => {
    return vehicles.filter((v) => v.status === 'AVAILABLE');
  }, [vehicles]);

  const handleCreateTrip = (e) => {
    e.preventDefault();
    (async () => {
      try {
        setError('');
        await axios.post(`${API_BASE}/api/trips`, {
          source: newTrip.source,
          destination: newTrip.destination,
          cargoWeight: Number(newTrip.cargoWeight),
          plannedDistance: Number(newTrip.plannedDistance),
          vehicleId: Number(newTrip.vehicleId),
          driverId: Number(newTrip.driverId),
        });
        setShowCreateModal(false);
        setNewTrip({ vehicleId: '', driverId: '', cargoWeight: '', source: '', destination: '', plannedDistance: '' });
        await refresh();
      } catch (e) {
        setError(e.response?.data?.error || 'Failed to create trip');
      }
    })();
  };

  const handleCompleteTrip = (e) => {
    e.preventDefault();
    (async () => {
      try {
        setError('');
        await axios.put(`${API_BASE}/api/trips/${selectedTrip.id}/complete`);
        setShowCompleteModal(false);
        await refresh();
      } catch (e) {
        setError(e.response?.data?.error || 'Failed to complete trip');
      }
    })();
  };

  const dispatchTrip = async (trip) => {
    try {
      setError('');
      await axios.put(`${API_BASE}/api/trips/${trip.id}/dispatch`);
      await refresh();
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to dispatch trip');
    }
  };

  const cancelTrip = async (trip) => {
    try {
      setError('');
      await axios.put(`${API_BASE}/api/trips/${trip.id}/cancel`);
      await refresh();
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to cancel trip');
    }
  };

  const openTimeline = async (trip) => {
    try {
      setTimelineTrip(trip);
      setShowTimelineModal(true);
      setTimelineLoading(true);
      setTimelineError('');
      const res = await axios.get(`${API_BASE}/api/trips/${trip.id}/events`);
      setTimelineEvents(res.data || []);
    } catch (e) {
      setTimelineError(e.response?.data?.error || 'Failed to load timeline');
      setTimelineEvents([]);
    } finally {
      setTimelineLoading(false);
    }
  };

  const postNote = async () => {
    if (!timelineTrip) return;
    const msg = newNote.trim();
    if (!msg) return;
    try {
      await axios.post(`${API_BASE}/api/trips/${timelineTrip.id}/events`, { message: msg });
      setNewNote('');
      const res = await axios.get(`${API_BASE}/api/trips/${timelineTrip.id}/events`);
      setTimelineEvents(res.data || []);
    } catch (e) {
      setTimelineError(e.response?.data?.error || 'Failed to post note');
    }
  };

  return (
    <div className="space-y-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md mb-lg">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Trips</h1>
          <p className="text-body-md text-on-surface-variant">Manage active logistics and dispatching schedules.</p>
        </div>
        {hasRole(['Dispatcher', 'Fleet Manager']) && (
          <button 
            className="bg-primary text-white px-lg py-md rounded-lg font-label-md flex items-center gap-sm hover:brightness-110 active:scale-95 transition-all shadow-sm"
            onClick={() => setShowCreateModal(true)}
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Create Trip
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
        <div className="bg-surface-container-lowest border border-outline-variant p-md rounded-lg">
          <span className="text-label-sm text-outline block mb-xs">Active Dispatches</span>
          <span className="text-headline-md font-bold">{trips.filter(t => t.status === 'DISPATCHED').length}</span>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant p-md rounded-lg">
          <span className="text-label-sm text-outline block mb-xs">Completed Today</span>
          <span className="text-headline-md font-bold">{trips.filter(t => t.status === 'COMPLETED').length}</span>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant p-md rounded-lg">
          <span className="text-label-sm text-outline block mb-xs">Pending Drafts</span>
          <span className="text-headline-md font-bold">{trips.filter(t => t.status === 'DRAFT').length}</span>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant p-md rounded-lg">
          <span className="text-label-sm text-outline block mb-xs">Total Cargo (MT)</span>
          <span className="text-headline-md font-bold text-primary">
            {(trips.reduce((acc, t) => acc + (t.cargoWeight || 0), 0) / 1000).toFixed(1)}
          </span>
        </div>
      </div>

      {error && (
        <div className="p-md bg-error/5 border border-error/20 rounded-lg text-body-md text-error">
          {error}
        </div>
      )}

      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-left">
                <th className="p-4 font-label-md text-label-md text-outline uppercase tracking-wider">Trip ID</th>
                <th className="p-4 font-label-md text-label-md text-outline uppercase tracking-wider">Source</th>
                <th className="p-4 font-label-md text-label-md text-outline uppercase tracking-wider">Destination</th>
                <th className="p-4 font-label-md text-label-md text-outline uppercase tracking-wider">Vehicle</th>
                <th className="p-4 font-label-md text-label-md text-outline uppercase tracking-wider">Driver</th>
                <th className="p-4 font-label-md text-label-md text-outline uppercase tracking-wider">Cargo (kg)</th>
                <th className="p-4 font-label-md text-label-md text-outline uppercase tracking-wider">Distance (km)</th>
                <th className="p-4 font-label-md text-label-md text-outline uppercase tracking-wider">Status</th>
                <th className="p-4 font-label-md text-label-md text-outline uppercase tracking-wider">Dispatched</th>
                <th className="p-4 font-label-md text-label-md text-outline uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="font-body-md divide-y divide-outline-variant">
              {loading ? (
                <tr>
                  <td className="p-4 text-secondary" colSpan={10}>Loading...</td>
                </tr>
              ) : trips.length === 0 ? (
                <tr>
                  <td className="p-4 text-secondary" colSpan={10}>No trips found.</td>
                </tr>
              ) : (
                trips.map(trip => (
                  <tr key={trip.id} className="hover:bg-surface-container-low transition-colors group">
                    <td className="p-4 font-bold">{formatTripId(trip.id)}</td>
                    <td className="p-4">{trip.source}</td>
                    <td className="p-4">{trip.destination}</td>
                    <td className="p-4">{trip.vehicle?.regNumber || trip.vehicle?.name || '-'}</td>
                    <td className="p-4">{trip.driver?.name || '-'}</td>
                    <td className="p-4">{Number(trip.cargoWeight || 0).toLocaleString()}</td>
                    <td className="p-4">{Number(trip.plannedDistance || 0)}</td>
                    <td className="p-4">
                      <span className={`px-sm py-xs rounded text-label-sm font-bold uppercase ${statusStyles[trip.status] || statusStyles.DRAFT}`}>
                        {trip.status}
                      </span>
                    </td>
                    <td className="p-4">{formatDateTime(trip.dispatchedAt)}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-sm flex-wrap">
                        <button
                          className="text-on-surface-variant hover:text-on-surface px-sm py-1 rounded transition-colors text-label-sm font-bold"
                          onClick={() => openTimeline(trip)}
                          type="button"
                        >
                          Timeline
                        </button>
                        {hasRole(['Dispatcher', 'Fleet Manager']) && trip.status === 'DRAFT' && (
                          <>
                            <button className="text-primary hover:bg-primary/10 px-sm py-1 rounded transition-colors text-label-sm font-bold" onClick={() => dispatchTrip(trip)} type="button">Dispatch</button>
                            <button className="text-error hover:bg-error/10 px-sm py-1 rounded transition-colors text-label-sm font-bold" onClick={() => cancelTrip(trip)} type="button">Cancel</button>
                          </>
                        )}
                        {(hasRole(['Dispatcher', 'Fleet Manager']) || hasRole('Driver')) && trip.status === 'DISPATCHED' && (
                          <>
                            <button className="text-primary hover:bg-primary/10 px-sm py-1 rounded transition-colors text-label-sm font-bold" onClick={() => { setSelectedTrip(trip); setShowCompleteModal(true); }} type="button">Complete</button>
                            {hasRole(['Dispatcher', 'Fleet Manager']) && (
                              <button className="text-error hover:bg-error/10 px-sm py-1 rounded transition-colors text-label-sm font-bold" onClick={() => cancelTrip(trip)} type="button">Cancel</button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] bg-on-surface/40 backdrop-blur-sm flex items-center justify-center p-md">
          <div className="bg-white w-full max-w-xl rounded-xl shadow-2xl overflow-hidden flex flex-col border border-outline-variant">
            <div className="p-lg border-b border-outline-variant flex items-center justify-between">
              <h2 className="font-headline-md text-headline-md">Create New Trip</h2>
              <button className="text-outline hover:text-on-surface" onClick={() => setShowCreateModal(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleCreateTrip} className="p-lg space-y-lg overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                <div className="space-y-xs">
                  <label className="text-label-sm font-bold text-outline">Vehicle Selection</label>
                  <select className="w-full border border-outline-variant rounded-lg p-sm focus:border-primary focus:ring-1 outline-none" value={newTrip.vehicleId} onChange={e => setNewTrip({ ...newTrip, vehicleId: e.target.value })} required>
                    <option value="">Select available vehicle</option>
                    {availableVehicles.map((v) => (
                      <option key={v.id} value={v.id}>{v.regNumber} ({v.status})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-xs">
                  <label className="text-label-sm font-bold text-outline">Assigned Driver</label>
                  <select className="w-full border border-outline-variant rounded-lg p-sm focus:border-primary focus:ring-1 outline-none" value={newTrip.driverId} onChange={e => setNewTrip({ ...newTrip, driverId: e.target.value })} required>
                    <option value="">Select valid driver</option>
                    {availableDrivers.map((d) => (
                      <option key={d.id} value={d.id}>{d.name} ({d.status})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-xs">
                <label className="text-label-sm font-bold text-outline">Cargo Weight (kg)</label>
                <input type="number" className="w-full border border-outline-variant rounded-lg p-sm focus:border-primary focus:ring-1 outline-none" placeholder="e.g. 12000" value={newTrip.cargoWeight} onChange={e => setNewTrip({ ...newTrip, cargoWeight: e.target.value })} required />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                <div className="space-y-xs">
                  <label className="text-label-sm font-bold text-outline">Source Location</label>
                  <input type="text" className="w-full border border-outline-variant rounded-lg p-sm focus:border-primary focus:ring-1 outline-none" placeholder="Start point" value={newTrip.source} onChange={e => setNewTrip({ ...newTrip, source: e.target.value })} required />
                </div>
                <div className="space-y-xs">
                  <label className="text-label-sm font-bold text-outline">Destination</label>
                  <input type="text" className="w-full border border-outline-variant rounded-lg p-sm focus:border-primary focus:ring-1 outline-none" placeholder="End point" value={newTrip.destination} onChange={e => setNewTrip({ ...newTrip, destination: e.target.value })} required />
                </div>
              </div>
              <div className="space-y-xs">
                <label className="text-label-sm font-bold text-outline">Planned Distance (km)</label>
                <input type="number" className="w-full border border-outline-variant rounded-lg p-sm focus:border-primary focus:ring-1 outline-none" placeholder="Distance estimate" value={newTrip.plannedDistance} onChange={e => setNewTrip({ ...newTrip, plannedDistance: e.target.value })} required />
              </div>
              <div className="flex justify-end gap-md pt-lg border-t border-outline-variant">
                <button type="button" className="px-lg py-md rounded-lg font-label-md text-outline hover:bg-surface-container" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="bg-primary text-white px-xl py-md rounded-lg font-label-md hover:brightness-110">Submit Trip</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complete Modal */}
      {showCompleteModal && selectedTrip && (
        <div className="fixed inset-0 z-[100] bg-on-surface/40 backdrop-blur-sm flex items-center justify-center p-md">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden border border-outline-variant">
            <div className="p-lg border-b border-outline-variant">
              <h2 className="font-headline-md text-headline-md">Complete Trip</h2>
            </div>
            <form onSubmit={handleCompleteTrip}>
              <div className="p-lg space-y-lg">
                <div className="p-md bg-primary-container/10 border border-primary-container/20 rounded-lg">
                  <p className="text-body-md text-on-primary-fixed-variant">Recording final metrics for <span className="font-bold">{formatTripId(selectedTrip.id)}</span>.</p>
                </div>
                <div className="space-y-xs">
                  <label className="text-label-sm font-bold text-outline">Final Odometer Reading</label>
                  <input type="number" required className="w-full border border-outline-variant rounded-lg p-sm focus:border-primary focus:ring-1 outline-none" placeholder="Enter current mileage" />
                </div>
                <div className="space-y-xs">
                  <label className="text-label-sm font-bold text-outline">Fuel Consumed (Liters)</label>
                  <input type="number" required className="w-full border border-outline-variant rounded-lg p-sm focus:border-primary focus:ring-1 outline-none" placeholder="Total fuel used" />
                </div>
              </div>
              <div className="p-lg bg-surface-container-low border-t border-outline-variant flex justify-end gap-md">
                <button type="button" className="px-lg py-md rounded-lg font-label-md text-outline" onClick={() => setShowCompleteModal(false)}>Cancel</button>
                <button type="submit" className="bg-primary text-white px-xl py-md rounded-lg font-label-md hover:brightness-110">Finalize & Close</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTimelineModal && timelineTrip && (
        <div className="fixed inset-0 z-[110] bg-on-surface/40 backdrop-blur-sm flex items-center justify-center p-md">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden border border-outline-variant">
            <div className="p-lg border-b border-outline-variant flex items-center justify-between gap-md">
              <div>
                <h2 className="font-headline-md text-headline-md">Trip Timeline</h2>
                <p className="text-body-md text-secondary mt-1">{formatTripId(timelineTrip.id)} · {timelineTrip.source} → {timelineTrip.destination}</p>
              </div>
              <button className="text-outline hover:text-on-surface" onClick={() => { setShowTimelineModal(false); setTimelineTrip(null); setTimelineEvents([]); setTimelineError(''); }} type="button">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-lg space-y-md max-h-[70vh] overflow-y-auto">
              {timelineError && (
                <div className="p-md bg-error/5 border border-error/20 rounded-lg text-body-md text-error">
                  {timelineError}
                </div>
              )}

              {timelineLoading ? (
                <div className="text-body-md text-secondary">Loading timeline...</div>
              ) : (
                <div className="space-y-md">
                  {timelineEvents.map((ev) => (
                    <div key={ev.id} className="flex gap-3">
                      <div className="w-2 flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                        <div className="flex-1 w-px bg-outline-variant"></div>
                      </div>
                      <div className="flex-1 pb-md">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2 py-1 rounded-full text-label-sm font-semibold bg-surface-container text-on-surface">{ev.type}</span>
                          <span className="text-label-sm text-secondary">{formatDateTime(ev.createdAt)}</span>
                        </div>
                        <div className="text-body-md text-on-surface mt-xs">{ev.message}</div>
                      </div>
                    </div>
                  ))}
                  {timelineEvents.length === 0 && (
                    <div className="text-body-md text-secondary">No events yet.</div>
                  )}
                </div>
              )}

              {hasRole('Driver') && (
                <div className="border-t border-outline-variant pt-md">
                  <div className="text-label-md font-semibold text-on-surface mb-sm">Post Note</div>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 border border-outline-variant rounded-lg p-2.5 text-body-md"
                      placeholder="e.g. Delayed by traffic"
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                    />
                    <button
                      className="bg-primary text-white px-4 py-2 rounded-lg font-label-md hover:brightness-110 disabled:opacity-60"
                      onClick={postNote}
                      type="button"
                      disabled={!newNote.trim()}
                    >
                      Send
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

export default Trips;
