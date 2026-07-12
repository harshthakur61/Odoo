import React, { useState } from 'react';

const mockTrips = [
  { id: 'TRP-9021', source: 'Depot A (Chicago)', destination: 'Distribution Ctr 4', vehicle: 'Truck-104', driver: 'Marcus Chen', cargo: 12400, distance: 452, status: 'DISPATCHED' },
  { id: 'TRP-9025', source: 'Depot B (Detroit)', destination: 'Local Retail H3', vehicle: 'Van-22', driver: 'Sarah Jenkins', cargo: 2100, distance: 85, status: 'DRAFT' },
  { id: 'TRP-9018', source: 'Depot A (Chicago)', destination: 'Airport Cargo T1', vehicle: 'Truck-88', driver: 'Leonid Volkov', cargo: 15000, distance: 32, status: 'COMPLETED' },
  { id: 'TRP-8999', source: 'Depot C (Austin)', destination: 'Warehouse 12', vehicle: 'Truck-50', driver: 'Emma Watson', cargo: 8200, distance: 120, status: 'CANCELLED' },
  { id: 'TRP-9022', source: 'Depot B (Detroit)', destination: 'Plant 9 (Toledo)', vehicle: 'Truck-112', driver: 'Oscar G.', cargo: 18500, distance: 95, status: 'DISPATCHED', distanceError: true },
  { id: 'TRP-9030', source: 'Depot A (Chicago)', destination: 'Distribution Ctr 1', vehicle: 'Van-04', driver: 'Aisha K.', cargo: 1400, distance: 12, status: 'DRAFT' },
];

const statusStyles = {
  DISPATCHED: 'bg-blue-100 text-blue-800',
  DRAFT: 'bg-gray-200 text-gray-700',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const Trips = () => {
  const [trips, setTrips] = useState(mockTrips);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);

  const [newTrip, setNewTrip] = useState({ vehicle: '', driver: '', cargo: '', source: '', destination: '', distance: '' });

  const handleCreateTrip = (e) => {
    e.preventDefault();
    setTrips(prev => [{
      id: `TRP-${Math.floor(1000 + Math.random() * 9000)}`,
      source: newTrip.source,
      destination: newTrip.destination,
      vehicle: newTrip.vehicle,
      driver: newTrip.driver,
      cargo: Number(newTrip.cargo),
      distance: Number(newTrip.distance),
      status: 'DRAFT'
    }, ...prev]);
    setShowCreateModal(false);
    setNewTrip({ vehicle: '', driver: '', cargo: '', source: '', destination: '', distance: '' });
  };

  const handleCompleteTrip = (e) => {
    e.preventDefault();
    setTrips(prev => prev.map(t => t.id === selectedTrip.id ? { ...t, status: 'COMPLETED' } : t));
    setShowCompleteModal(false);
  };

  const changeStatus = (id, newStatus) => {
    setTrips(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };

  return (
    <div className="space-y-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md mb-lg">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Trips</h1>
          <p className="text-body-md text-on-surface-variant">Manage active logistics and dispatching schedules.</p>
        </div>
        <button 
          className="bg-primary text-white px-lg py-md rounded-lg font-label-md flex items-center gap-sm hover:brightness-110 active:scale-95 transition-all shadow-sm"
          onClick={() => setShowCreateModal(true)}
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Create Trip
        </button>
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
            {(trips.reduce((acc, t) => acc + t.cargo, 0) / 1000).toFixed(1)}
          </span>
        </div>
      </div>

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
                <th className="p-4 font-label-md text-label-md text-outline uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="font-body-md divide-y divide-outline-variant">
              {trips.map(trip => (
                <tr key={trip.id} className="hover:bg-surface-container-low transition-colors group">
                  <td className="p-4 font-bold">{trip.id}</td>
                  <td className="p-4">{trip.source}</td>
                  <td className="p-4">{trip.destination}</td>
                  <td className="p-4">{trip.vehicle}</td>
                  <td className="p-4">{trip.driver}</td>
                  <td className="p-4">{trip.cargo.toLocaleString()}</td>
                  <td className={`p-4 ${trip.distanceError ? 'text-error font-bold' : ''}`}>{trip.distance}</td>
                  <td className="p-4">
                    <span className={`px-sm py-xs rounded text-label-sm font-bold uppercase ${statusStyles[trip.status]}`}>
                      {trip.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {trip.status === 'DISPATCHED' && (
                      <div className="flex items-center justify-end gap-sm">
                        <button className="text-primary hover:bg-primary/10 px-sm py-1 rounded transition-colors text-label-sm font-bold" onClick={() => { setSelectedTrip(trip); setShowCompleteModal(true); }}>Complete</button>
                        <button className="text-error hover:bg-error/10 px-sm py-1 rounded transition-colors text-label-sm font-bold" onClick={() => changeStatus(trip.id, 'CANCELLED')}>Cancel</button>
                      </div>
                    )}
                    {trip.status === 'DRAFT' && (
                      <div className="flex items-center justify-end gap-sm">
                        <button className="text-primary hover:bg-primary/10 px-sm py-1 rounded transition-colors text-label-sm font-bold" onClick={() => changeStatus(trip.id, 'DISPATCHED')}>Dispatch</button>
                        <button className="text-error hover:bg-error/10 px-sm py-1 rounded transition-colors text-label-sm font-bold" onClick={() => changeStatus(trip.id, 'CANCELLED')}>Cancel</button>
                      </div>
                    )}
                    {(trip.status === 'COMPLETED' || trip.status === 'CANCELLED') && (
                      <button className="text-on-surface-variant hover:text-on-surface p-1 rounded">
                        <span className="material-symbols-outlined text-[20px]">more_vert</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
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
                  <select className="w-full border border-outline-variant rounded-lg p-sm focus:border-primary focus:ring-1 outline-none" value={newTrip.vehicle} onChange={e => setNewTrip({...newTrip, vehicle: e.target.value})} required>
                    <option value="">Select available vehicle</option>
                    <option value="Truck-104">Truck-104 (Available)</option>
                    <option value="Van-22">Van-22 (Available)</option>
                    <option value="Truck-50">Truck-50 (Available)</option>
                  </select>
                </div>
                <div className="space-y-xs">
                  <label className="text-label-sm font-bold text-outline">Assigned Driver</label>
                  <select className="w-full border border-outline-variant rounded-lg p-sm focus:border-primary focus:ring-1 outline-none" value={newTrip.driver} onChange={e => setNewTrip({...newTrip, driver: e.target.value})} required>
                    <option value="">Select valid driver</option>
                    <option value="Marcus Chen">Marcus Chen (Valid)</option>
                    <option value="Jenny Slack">Jenny Slack (Valid)</option>
                    <option value="Leonid Volkov">Leonid Volkov (Valid)</option>
                  </select>
                </div>
              </div>
              <div className="space-y-xs">
                <label className="text-label-sm font-bold text-outline">Cargo Weight (kg)</label>
                <input type="number" className="w-full border border-outline-variant rounded-lg p-sm focus:border-primary focus:ring-1 outline-none" placeholder="e.g. 12000" value={newTrip.cargo} onChange={e => setNewTrip({...newTrip, cargo: e.target.value})} required />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                <div className="space-y-xs">
                  <label className="text-label-sm font-bold text-outline">Source Location</label>
                  <input type="text" className="w-full border border-outline-variant rounded-lg p-sm focus:border-primary focus:ring-1 outline-none" placeholder="Start point" value={newTrip.source} onChange={e => setNewTrip({...newTrip, source: e.target.value})} required />
                </div>
                <div className="space-y-xs">
                  <label className="text-label-sm font-bold text-outline">Destination</label>
                  <input type="text" className="w-full border border-outline-variant rounded-lg p-sm focus:border-primary focus:ring-1 outline-none" placeholder="End point" value={newTrip.destination} onChange={e => setNewTrip({...newTrip, destination: e.target.value})} required />
                </div>
              </div>
              <div className="space-y-xs">
                <label className="text-label-sm font-bold text-outline">Planned Distance (km)</label>
                <input type="number" className="w-full border border-outline-variant rounded-lg p-sm focus:border-primary focus:ring-1 outline-none" placeholder="Distance estimate" value={newTrip.distance} onChange={e => setNewTrip({...newTrip, distance: e.target.value})} required />
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
                  <p className="text-body-md text-on-primary-fixed-variant">Recording final metrics for <span className="font-bold">{selectedTrip.id}</span>.</p>
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
    </div>
  );
};

export default Trips;
