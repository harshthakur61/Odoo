import React, { useState } from 'react';

const mockVehicles = [
  { id: 1, regNumber: 'TX-9902', name: 'Silverstone Titan', type: 'Heavy Truck', maxLoad: 12500, odometer: 42310, acquisitionCost: 84500, status: 'AVAILABLE', region: 'Central' },
  { id: 2, regNumber: 'TX-4188', name: 'Atlas Carrier', type: 'Panel Van', maxLoad: 3200, odometer: 118502, acquisitionCost: 42000, status: 'ON_TRIP', region: 'North' },
  { id: 3, regNumber: 'TX-0021', name: 'Mercury Transit', type: 'Transit Van', maxLoad: 2100, odometer: 256001, acquisitionCost: 38500, status: 'IN_SHOP', region: 'South-East' },
  { id: 4, regNumber: 'TX-5512', name: 'Nordic Hauler', type: 'Heavy Truck', maxLoad: 14000, odometer: 12400, acquisitionCost: 92000, status: 'AVAILABLE', region: 'Central' },
  { id: 5, regNumber: 'TX-0001', name: 'Legacy Line', type: 'Panel Van', maxLoad: 3000, odometer: 502331, acquisitionCost: 28000, status: 'RETIRED', region: 'North' },
  { id: 6, regNumber: 'TX-7712', name: 'Apex Mover', type: 'Heavy Truck', maxLoad: 11800, odometer: 88290, acquisitionCost: 79000, status: 'IN_SHOP', region: 'Central' },
];

const statusConfig = {
  AVAILABLE: { label: 'Available', bg: 'bg-green-100', text: 'text-green-900', dot: 'bg-green-500' },
  ON_TRIP: { label: 'On Trip', bg: 'bg-blue-100', text: 'text-blue-900', dot: 'bg-blue-500' },
  IN_SHOP: { label: 'In Shop', bg: 'bg-amber-100', text: 'text-amber-900', dot: 'bg-amber-500' },
  RETIRED: { label: 'Retired', bg: 'bg-gray-200', text: 'text-gray-700', dot: 'bg-gray-500' },
};

const emptyVehicle = { regNumber: '', name: '', type: 'Heavy Truck', maxLoad: '', odometer: '', acquisitionCost: '', region: 'Central' };

const Vehicles = () => {
  const [vehicles, setVehicles] = useState(mockVehicles);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editVehicle, setEditVehicle] = useState(null);
  const [newVehicle, setNewVehicle] = useState({ ...emptyVehicle });

  const filteredVehicles = vehicles.filter(v => {
    if (statusFilter !== 'all' && v.status !== statusFilter) return false;
    if (typeFilter !== 'all' && v.type !== typeFilter) return false;
    if (regionFilter !== 'all' && v.region !== regionFilter) return false;
    return true;
  });

  const handleAddVehicle = () => {
    setVehicles(prev => [...prev, { ...newVehicle, id: Date.now(), status: 'AVAILABLE', maxLoad: Number(newVehicle.maxLoad), odometer: Number(newVehicle.odometer) }]);
    setNewVehicle({ ...emptyVehicle });
    setShowAddModal(false);
  };

  const handleEditVehicle = () => {
    setVehicles(prev => prev.map(v => v.id === editVehicle.id ? editVehicle : v));
    setShowEditModal(false);
    setEditVehicle(null);
  };

  return (
    <>
      {/* Page Header & Toolbar */}
      <div className="space-y-lg">
        <div className="flex justify-between items-end">
          <div>
            <nav className="flex text-label-md text-outline mb-1 gap-1">
              <span>Fleet</span>
              <span>/</span>
              <span className="text-on-surface">Vehicles</span>
            </nav>
            <h3 className="font-headline-lg text-headline-lg text-on-surface">Vehicles</h3>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#0D9488] text-white px-lg py-sm rounded-lg font-label-md flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Add Vehicle
          </button>
        </div>

        {/* Toolbar: Filters */}
        <div className="flex justify-between items-center bg-white p-md border border-outline-variant rounded-lg">
          <div className="flex gap-md">
            <div className="flex flex-col gap-xs">
              <label className="text-label-sm text-outline uppercase tracking-wider">Status</label>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-surface-container-lowest border border-outline-variant rounded-md px-md py-1 text-body-md focus:border-primary focus:ring-0"
              >
                <option value="all">All Statuses</option>
                <option value="AVAILABLE">Available</option>
                <option value="ON_TRIP">On Trip</option>
                <option value="IN_SHOP">In Shop</option>
                <option value="RETIRED">Retired</option>
              </select>
            </div>
            <div className="flex flex-col gap-xs">
              <label className="text-label-sm text-outline uppercase tracking-wider">Type</label>
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="bg-surface-container-lowest border border-outline-variant rounded-md px-md py-1 text-body-md focus:border-primary focus:ring-0"
              >
                <option value="all">All Types</option>
                <option value="Heavy Truck">Heavy Truck</option>
                <option value="Panel Van">Panel Van</option>
                <option value="Transit Van">Transit Van</option>
              </select>
            </div>
            <div className="flex flex-col gap-xs">
              <label className="text-label-sm text-outline uppercase tracking-wider">Region</label>
              <select
                value={regionFilter}
                onChange={e => setRegionFilter(e.target.value)}
                className="bg-surface-container-lowest border border-outline-variant rounded-md px-md py-1 text-body-md focus:border-primary focus:ring-0"
              >
                <option value="all">All Regions</option>
                <option value="North">North</option>
                <option value="South-East">South-East</option>
                <option value="Central">Central</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-sm">
            <span className="text-label-md text-outline">Showing {filteredVehicles.length} of {vehicles.length} vehicles</span>
          </div>
        </div>

        {/* Vehicle Table */}
        <div className="bg-white border border-outline-variant rounded-lg overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                <th className="px-lg py-md text-label-md text-outline font-medium">Reg#</th>
                <th className="px-lg py-md text-label-md text-outline font-medium">Name</th>
                <th className="px-lg py-md text-label-md text-outline font-medium">Type</th>
                <th className="px-lg py-md text-label-md text-outline font-medium">Max Load</th>
                <th className="px-lg py-md text-label-md text-outline font-medium">Odometer</th>
                <th className="px-lg py-md text-label-md text-outline font-medium">Status</th>
                <th className="px-lg py-md text-label-md text-outline font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {filteredVehicles.map(vehicle => {
                const sc = statusConfig[vehicle.status];
                return (
                  <tr
                    key={vehicle.id}
                    className={`hover:bg-surface-container-low transition-colors cursor-pointer group ${vehicle.status === 'RETIRED' ? 'opacity-60 bg-surface-dim/20' : ''}`}
                    onClick={() => { setEditVehicle({ ...vehicle }); setShowEditModal(true); }}
                  >
                    <td className="px-lg py-md font-medium text-primary">{vehicle.regNumber}</td>
                    <td className="px-lg py-md">{vehicle.name}</td>
                    <td className="px-lg py-md text-on-surface-variant">{vehicle.type}</td>
                    <td className="px-lg py-md text-on-surface-variant">{vehicle.maxLoad.toLocaleString()} kg</td>
                    <td className="px-lg py-md text-on-surface-variant">{vehicle.odometer.toLocaleString()} km</td>
                    <td className="px-lg py-md">
                      <span className={`${sc.bg} ${sc.text} px-sm py-xs rounded text-[11px] font-bold uppercase tracking-wider`}>
                        {sc.label}
                      </span>
                    </td>
                    <td className="px-lg py-md text-right" onClick={e => e.stopPropagation()}>
                      <button className="p-1 text-outline hover:text-error transition-colors">
                        <span className="material-symbols-outlined">archive</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredVehicles.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-lg py-xl text-center text-outline">No vehicles match your filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Vehicle Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-xl bg-on-surface/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-lg border border-outline-variant overflow-hidden flex flex-col">
            <div className="px-lg py-md border-b border-outline-variant flex justify-between items-center bg-surface-bright">
              <h4 className="font-headline-md text-headline-md">Register new vehicle</h4>
              <button className="p-1 hover:bg-surface-container-low rounded-full" onClick={() => setShowAddModal(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-lg grid grid-cols-2 gap-lg">
              <div className="flex flex-col gap-xs">
                <label className="text-label-sm text-outline uppercase">Reg number</label>
                <input className="border border-outline-variant rounded-lg px-md py-sm focus:border-primary focus:ring-0" type="text" placeholder="TX-0000" value={newVehicle.regNumber} onChange={e => setNewVehicle(p => ({ ...p, regNumber: e.target.value }))} />
              </div>
              <div className="flex flex-col gap-xs">
                <label className="text-label-sm text-outline uppercase">Name</label>
                <input className="border border-outline-variant rounded-lg px-md py-sm focus:border-primary focus:ring-0" type="text" placeholder="e.g. Atlas Carrier" value={newVehicle.name} onChange={e => setNewVehicle(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="flex flex-col gap-xs">
                <label className="text-label-sm text-outline uppercase">Type</label>
                <select className="border border-outline-variant rounded-lg px-md py-sm focus:border-primary focus:ring-0" value={newVehicle.type} onChange={e => setNewVehicle(p => ({ ...p, type: e.target.value }))}>
                  <option>Heavy Truck</option>
                  <option>Panel Van</option>
                  <option>Transit Van</option>
                </select>
              </div>
              <div className="flex flex-col gap-xs">
                <label className="text-label-sm text-outline uppercase">Max load (kg)</label>
                <input className="border border-outline-variant rounded-lg px-md py-sm focus:border-primary focus:ring-0" type="number" value={newVehicle.maxLoad} onChange={e => setNewVehicle(p => ({ ...p, maxLoad: e.target.value }))} />
              </div>
              <div className="flex flex-col gap-xs">
                <label className="text-label-sm text-outline uppercase">Initial Odometer</label>
                <input className="border border-outline-variant rounded-lg px-md py-sm focus:border-primary focus:ring-0" type="number" placeholder="0" value={newVehicle.odometer} onChange={e => setNewVehicle(p => ({ ...p, odometer: e.target.value }))} />
              </div>
              <div className="flex flex-col gap-xs">
                <label className="text-label-sm text-outline uppercase">Acquisition cost</label>
                <input className="border border-outline-variant rounded-lg px-md py-sm focus:border-primary focus:ring-0" type="text" placeholder="0.00" value={newVehicle.acquisitionCost} onChange={e => setNewVehicle(p => ({ ...p, acquisitionCost: e.target.value }))} />
              </div>
            </div>
            <div className="px-lg py-md border-t border-outline-variant bg-surface-bright flex justify-end gap-md">
              <button className="px-lg py-sm border border-outline-variant rounded-lg text-on-surface-variant font-label-md hover:bg-surface-container-low transition-colors" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="px-lg py-sm bg-[#0D9488] text-white rounded-lg font-label-md hover:opacity-90 transition-opacity" onClick={handleAddVehicle}>Save vehicle</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Vehicle Modal */}
      {showEditModal && editVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-xl bg-on-surface/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-lg border border-outline-variant overflow-hidden flex flex-col">
            <div className="px-lg py-md border-b border-outline-variant flex justify-between items-center bg-surface-bright">
              <h4 className="font-headline-md text-headline-md">Edit vehicle: {editVehicle.regNumber}</h4>
              <button className="p-1 hover:bg-surface-container-low rounded-full" onClick={() => setShowEditModal(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-lg grid grid-cols-2 gap-lg">
              <div className="flex flex-col gap-xs">
                <label className="text-label-sm text-outline uppercase">Reg number</label>
                <input className="border border-outline-variant rounded-lg px-md py-sm focus:border-primary focus:ring-0" type="text" value={editVehicle.regNumber} onChange={e => setEditVehicle(p => ({ ...p, regNumber: e.target.value }))} />
              </div>
              <div className="flex flex-col gap-xs">
                <label className="text-label-sm text-outline uppercase">Name</label>
                <input className="border border-outline-variant rounded-lg px-md py-sm focus:border-primary focus:ring-0" type="text" value={editVehicle.name} onChange={e => setEditVehicle(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="flex flex-col gap-xs">
                <label className="text-label-sm text-outline uppercase">Type</label>
                <select className="border border-outline-variant rounded-lg px-md py-sm focus:border-primary focus:ring-0" value={editVehicle.type} onChange={e => setEditVehicle(p => ({ ...p, type: e.target.value }))}>
                  <option>Heavy Truck</option>
                  <option>Panel Van</option>
                  <option>Transit Van</option>
                </select>
              </div>
              <div className="flex flex-col gap-xs">
                <label className="text-label-sm text-outline uppercase">Max load (kg)</label>
                <input className="border border-outline-variant rounded-lg px-md py-sm focus:border-primary focus:ring-0" type="number" value={editVehicle.maxLoad} onChange={e => setEditVehicle(p => ({ ...p, maxLoad: Number(e.target.value) }))} />
              </div>
              <div className="flex flex-col gap-xs">
                <label className="text-label-sm text-outline uppercase">Odometer (km)</label>
                <input className="border border-outline-variant rounded-lg px-md py-sm focus:border-primary focus:ring-0" type="number" value={editVehicle.odometer} onChange={e => setEditVehicle(p => ({ ...p, odometer: Number(e.target.value) }))} />
              </div>
              <div className="flex flex-col gap-xs">
                <label className="text-label-sm text-outline uppercase">Acquisition cost</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-outline text-body-md">$</span>
                  <input className="border border-outline-variant rounded-lg pl-8 pr-md py-sm w-full focus:border-primary focus:ring-0" type="text" value={editVehicle.acquisitionCost?.toLocaleString()} onChange={e => setEditVehicle(p => ({ ...p, acquisitionCost: Number(e.target.value.replace(/,/g, '')) }))} />
                </div>
              </div>
              <div className="flex flex-col gap-xs">
                <label className="text-label-sm text-outline uppercase">Region</label>
                <select className="border border-outline-variant rounded-lg px-md py-sm focus:border-primary focus:ring-0" value={editVehicle.region} onChange={e => setEditVehicle(p => ({ ...p, region: e.target.value }))}>
                  <option>Central</option>
                  <option>North</option>
                  <option>South-East</option>
                </select>
              </div>
              <div className="flex flex-col gap-xs">
                <label className="text-label-sm text-outline uppercase">Status (Read-only)</label>
                <div className="bg-surface-container-low border border-outline-variant rounded-lg px-md py-sm text-on-surface-variant flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${statusConfig[editVehicle.status]?.dot}`}></div>
                  {statusConfig[editVehicle.status]?.label}
                </div>
              </div>
            </div>
            <div className="px-lg py-md border-t border-outline-variant bg-surface-bright flex justify-end gap-md">
              <button className="px-lg py-sm border border-outline-variant rounded-lg text-on-surface-variant font-label-md hover:bg-surface-container-low transition-colors" onClick={() => setShowEditModal(false)}>Cancel</button>
              <button className="px-lg py-sm bg-[#0D9488] text-white rounded-lg font-label-md hover:opacity-90 transition-opacity" onClick={handleEditVehicle}>Save vehicle</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Vehicles;
