import React, { useState } from 'react';

const mockHistory = [
  {
    id: 'TRP-9041',
    date: 'Jul 11, 2026',
    vehicle: 'Ford Transit (VAN-042)',
    source: 'Depot A (Chicago)',
    destination: 'Local Retail H3',
    cargo: '2,100 kg - Electronics',
    status: 'Completed',
    acceptedAt: 'Jul 11, 2026, 09:10 AM',
    completedAt: 'Jul 11, 2026, 03:45 PM',
    distance: '142 km',
  },
  {
    id: 'TRP-9038',
    date: 'Jul 10, 2026',
    vehicle: 'Scania R450 (TRK-771)',
    source: 'Warehouse B (Evanston)',
    destination: 'North Shore Depot',
    cargo: '4,800 kg - Auto Parts',
    status: 'Completed',
    acceptedAt: 'Jul 10, 2026, 07:30 AM',
    completedAt: 'Jul 10, 2026, 01:20 PM',
    distance: '88 km',
  },
  {
    id: 'TRP-9032',
    date: 'Jul 9, 2026',
    vehicle: 'Volvo FH16 (TRK-902)',
    source: 'Depot A (Chicago)',
    destination: 'Midwest Fulfillment Center',
    cargo: '7,200 kg - General Goods',
    status: 'Declined',
    acceptedAt: '—',
    completedAt: '—',
    distance: '—',
  },
  {
    id: 'TRP-9029',
    date: 'Jul 8, 2026',
    vehicle: 'Ford Transit (VAN-042)',
    source: 'City Terminal',
    destination: 'Distribution Hub 5',
    cargo: '1,400 kg - Perishables',
    status: 'Completed',
    acceptedAt: 'Jul 8, 2026, 06:00 AM',
    completedAt: 'Jul 8, 2026, 11:15 AM',
    distance: '64 km',
  },
  {
    id: 'TRP-9021',
    date: 'Jul 6, 2026',
    vehicle: 'Ford Transit (VAN-042)',
    source: 'Depot A (Chicago)',
    destination: 'Airport Express Terminal',
    cargo: '950 kg - Documents',
    status: 'Completed',
    acceptedAt: 'Jul 6, 2026, 10:45 AM',
    completedAt: 'Jul 6, 2026, 02:30 PM',
    distance: '51 km',
  },
];

const statusColors = {
  Completed: 'bg-primary/10 text-primary',
  Declined: 'bg-error/10 text-error',
};

const DriverHistory = () => {
  const [selectedTrip, setSelectedTrip] = useState(null);

  return (
    <div className="space-y-lg">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface">Trip History</h2>
          <p className="text-body-md text-secondary mt-1">All your past trip assignments and their outcomes.</p>
        </div>
        <div className="flex items-center gap-md text-label-sm text-secondary">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary inline-block"></span> Completed: {mockHistory.filter(t => t.status === 'Completed').length}</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-error inline-block"></span> Declined: {mockHistory.filter(t => t.status === 'Declined').length}</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                <th className="px-lg py-4 font-label-md text-label-md text-secondary">Trip ID</th>
                <th className="px-lg py-4 font-label-md text-label-md text-secondary">Date</th>
                <th className="px-lg py-4 font-label-md text-label-md text-secondary">Vehicle</th>
                <th className="px-lg py-4 font-label-md text-label-md text-secondary">Route</th>
                <th className="px-lg py-4 font-label-md text-label-md text-secondary">Distance</th>
                <th className="px-lg py-4 font-label-md text-label-md text-secondary">Status</th>
                <th className="px-lg py-4 font-label-md text-label-md text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {mockHistory.map(trip => (
                <tr key={trip.id} className="hover:bg-surface-container transition-colors group">
                  <td className="px-lg py-4 font-body-md font-bold text-primary">{trip.id}</td>
                  <td className="px-lg py-4 font-body-md text-body-md text-secondary">{trip.date}</td>
                  <td className="px-lg py-4 font-body-md text-body-md">{trip.vehicle}</td>
                  <td className="px-lg py-4">
                    <div className="flex items-center gap-2 text-body-md">
                      <span className="text-secondary">{trip.source}</span>
                      <span className="material-symbols-outlined text-[14px] text-outline">arrow_forward</span>
                      <span>{trip.destination}</span>
                    </div>
                  </td>
                  <td className="px-lg py-4 font-body-md text-body-md">{trip.distance}</td>
                  <td className="px-lg py-4">
                    <span className={`px-3 py-1 rounded-full text-label-sm font-bold ${statusColors[trip.status]}`}>
                      {trip.status}
                    </span>
                  </td>
                  <td className="px-lg py-4">
                    <button
                      onClick={() => setSelectedTrip(trip)}
                      className="p-1 text-secondary hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
                      title="View Details"
                    >
                      <span className="material-symbols-outlined text-[20px]">info</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedTrip && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-xl border border-outline-variant shadow-2xl">
            <div className="p-lg border-b border-outline-variant flex justify-between items-center">
              <h3 className="font-headline-md text-headline-md font-bold text-primary">Trip {selectedTrip.id}</h3>
              <button onClick={() => setSelectedTrip(null)} className="text-secondary hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-lg space-y-md">
              <div className="grid grid-cols-2 gap-md">
                <div>
                  <p className="text-label-sm text-secondary">Date</p>
                  <p className="font-body-md font-medium">{selectedTrip.date}</p>
                </div>
                <div>
                  <p className="text-label-sm text-secondary">Status</p>
                  <span className={`px-3 py-1 rounded-full text-label-sm font-bold ${statusColors[selectedTrip.status]}`}>{selectedTrip.status}</span>
                </div>
                <div>
                  <p className="text-label-sm text-secondary">Vehicle</p>
                  <p className="font-body-md font-medium">{selectedTrip.vehicle}</p>
                </div>
                <div>
                  <p className="text-label-sm text-secondary">Distance</p>
                  <p className="font-body-md font-medium">{selectedTrip.distance}</p>
                </div>
                <div>
                  <p className="text-label-sm text-secondary">Pickup</p>
                  <p className="font-body-md font-medium">{selectedTrip.source}</p>
                </div>
                <div>
                  <p className="text-label-sm text-secondary">Destination</p>
                  <p className="font-body-md font-medium">{selectedTrip.destination}</p>
                </div>
                <div>
                  <p className="text-label-sm text-secondary">Cargo</p>
                  <p className="font-body-md font-medium">{selectedTrip.cargo}</p>
                </div>
              </div>

              <div className="pt-md border-t border-outline-variant">
                <p className="text-label-sm text-secondary font-bold mb-md">Timeline</p>
                <div className="space-y-sm">
                  <div className="flex justify-between text-body-md">
                    <span className="text-secondary">Assigned</span>
                    <span>{selectedTrip.date}</span>
                  </div>
                  <div className="flex justify-between text-body-md">
                    <span className="text-secondary">Accepted At</span>
                    <span>{selectedTrip.acceptedAt}</span>
                  </div>
                  <div className="flex justify-between text-body-md">
                    <span className="text-secondary">Completed At</span>
                    <span>{selectedTrip.completedAt}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverHistory;
