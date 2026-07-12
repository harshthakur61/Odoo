import React, { useState } from 'react';

const mockLogs = [
  { id: 1, vehicle: 'Truck 04', type: 'Oil Change', description: 'Routine maintenance', cost: 150, status: 'CLOSED', start: '2023-10-01', end: '2023-10-01' },
  { id: 2, vehicle: 'Van 12', type: 'Brake Inspection', description: 'Squeaking brakes reported by driver', cost: 200, status: 'ACTIVE', start: '2023-10-25', end: 'In progress' },
  { id: 3, vehicle: 'Trailer 09', type: 'Tire Rotation', description: 'Periodic rotation', cost: 80, status: 'CLOSED', start: '2023-09-15', end: '2023-09-15' },
  { id: 4, vehicle: 'Truck 02', type: 'Engine Overhaul', description: 'Major service, cylinder head replacement and gasket work', cost: 2500, status: 'ACTIVE', start: '2023-10-20', end: 'In progress' },
  { id: 5, vehicle: 'Van 05', type: 'Headlight Replacement', description: 'Left bulb burnt out', cost: 45, status: 'CLOSED', start: '2023-10-10', end: '2023-10-10' },
];

const Maintenance = () => {
  const [logs, setLogs] = useState(mockLogs);
  const [showModal, setShowModal] = useState(false);
  const [newLog, setNewLog] = useState({ vehicle: '', type: '', description: '', cost: '', start: new Date().toISOString().split('T')[0] });

  const handleAdd = (e) => {
    e.preventDefault();
    setLogs(prev => [{
      id: Date.now(),
      vehicle: newLog.vehicle,
      type: newLog.type,
      description: newLog.description,
      cost: Number(newLog.cost),
      status: 'ACTIVE',
      start: newLog.start,
      end: 'In progress'
    }, ...prev]);
    setShowModal(false);
    setNewLog({ vehicle: '', type: '', description: '', cost: '', start: new Date().toISOString().split('T')[0] });
  };

  const closeLog = (id) => {
    setLogs(prev => prev.map(l => l.id === id ? { ...l, status: 'CLOSED', end: new Date().toISOString().split('T')[0] } : l));
  };

  return (
    <div className="space-y-lg">
      <div className="flex justify-between items-center mb-lg">
        <div>
          <h3 className="font-headline-lg text-headline-lg text-on-surface">Maintenance History</h3>
          <p className="text-body-md text-on-surface-variant">Monitor and update vehicle service logs.</p>
        </div>
        <button 
          className="flex items-center gap-2 bg-[#0D9488] text-white px-lg py-2.5 rounded-lg font-body-md font-bold hover:bg-[#0b7a70] active:scale-98 transition-all shadow-none"
          onClick={() => setShowModal(true)}
        >
          <span className="material-symbols-outlined">add</span>
          Add Maintenance
        </button>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-surface-container-low border-b border-outline-variant">
            <tr>
              <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Vehicle</th>
              <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Type</th>
              <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Description</th>
              <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Cost</th>
              <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-center">Status</th>
              <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Start Date</th>
              <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">End Date</th>
              <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {logs.map(log => (
              <tr key={log.id} className="hover:bg-surface-container-low transition-colors group">
                <td className="px-lg py-md font-body-md text-on-surface font-medium">{log.vehicle}</td>
                <td className="px-lg py-md font-body-md text-on-surface">{log.type}</td>
                <td className="px-lg py-md font-body-md text-on-surface-variant max-w-xs truncate">{log.description}</td>
                <td className="px-lg py-md font-body-md text-on-surface font-mono">${log.cost}</td>
                <td className="px-lg py-md text-center">
                  {log.status === 'CLOSED' ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-label-sm font-bold bg-[#86efac] text-[#064e3b]">Closed</span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-label-sm font-bold bg-[#fef08a] text-[#713f12]">Active</span>
                  )}
                </td>
                <td className="px-lg py-md font-body-md text-on-surface-variant">{log.start}</td>
                <td className={`px-lg py-md font-body-md ${log.status === 'ACTIVE' ? 'text-outline italic' : 'text-on-surface-variant'}`}>{log.end}</td>
                <td className="px-lg py-md text-right">
                  {log.status === 'ACTIVE' && (
                    <button className="p-1.5 rounded-full text-primary hover:bg-primary/10 transition-all" onClick={() => closeLog(log.id)} title="Mark as Closed">
                      <span className="material-symbols-outlined">check_circle</span>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="relative bg-white w-full max-w-lg rounded-xl border border-outline-variant shadow-lg overflow-hidden">
            <div className="flex items-center justify-between px-lg py-md bg-surface-container-low border-b border-outline-variant">
              <h4 className="font-headline-md text-headline-md text-on-surface">Add Maintenance Record</h4>
              <button className="p-1 hover:bg-surface-container-highest rounded-full transition-all" onClick={() => setShowModal(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form className="p-lg space-y-md" onSubmit={handleAdd}>
              <div className="grid grid-cols-2 gap-md">
                <div className="space-y-xs">
                  <label className="font-label-md text-on-surface-variant">Vehicle</label>
                  <select required className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-md py-2 text-body-md outline-none" value={newLog.vehicle} onChange={e => setNewLog({...newLog, vehicle: e.target.value})}>
                    <option value="">Select vehicle</option>
                    <option>Truck 01</option>
                    <option>Truck 02</option>
                    <option>Van 05</option>
                    <option>Van 12</option>
                    <option>Trailer 09</option>
                  </select>
                </div>
                <div className="space-y-xs">
                  <label className="font-label-md text-on-surface-variant">Type</label>
                  <select required className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-md py-2 text-body-md outline-none" value={newLog.type} onChange={e => setNewLog({...newLog, type: e.target.value})}>
                    <option value="">Select type</option>
                    <option>Routine</option>
                    <option>Repair</option>
                    <option>Inspection</option>
                    <option>Cleaning</option>
                  </select>
                </div>
              </div>
              <div className="space-y-xs">
                <label className="font-label-md text-on-surface-variant">Description</label>
                <textarea required className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-md py-2 text-body-md outline-none min-h-[100px]" value={newLog.description} onChange={e => setNewLog({...newLog, description: e.target.value})}></textarea>
              </div>
              <div className="grid grid-cols-2 gap-md">
                <div className="space-y-xs">
                  <label className="font-label-md text-on-surface-variant">Cost ($)</label>
                  <input required type="number" step="0.01" className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-md py-2 text-body-md outline-none" value={newLog.cost} onChange={e => setNewLog({...newLog, cost: e.target.value})} />
                </div>
                <div className="space-y-xs">
                  <label className="font-label-md text-on-surface-variant">Start Date</label>
                  <input required type="date" className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-md py-2 text-body-md outline-none" value={newLog.start} onChange={e => setNewLog({...newLog, start: e.target.value})} />
                </div>
              </div>
              <div className="pt-lg flex justify-end gap-md border-t border-outline-variant mt-lg">
                <button type="button" className="px-lg py-2 rounded-lg border border-outline-variant font-body-md font-bold text-on-surface-variant hover:bg-surface-container-low transition-all" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="px-lg py-2 rounded-lg bg-[#0D9488] text-white font-body-md font-bold hover:bg-[#0b7a70] active:scale-95 transition-all">Save Log</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Maintenance;
