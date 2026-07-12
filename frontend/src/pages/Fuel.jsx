import React, { useState } from 'react';

const mockFuel = [
  { id: 1, date: 'Oct 24, 2023, 08:30 AM', vehicle: 'Volvo FH16 (TRK-902)', trip: 'Trip #1024', liters: '450.0 L', cost: '$720.00' },
  { id: 2, date: 'Oct 24, 2023, 10:15 AM', vehicle: 'Ford Transit (VAN-042)', trip: 'No Linked Trip', liters: '82.5 L', cost: '$135.30' },
  { id: 3, date: 'Oct 23, 2023, 04:50 PM', vehicle: 'Scania R450 (TRK-771)', trip: 'Trip #1021', liters: '310.0 L', cost: '$496.00' },
  { id: 4, date: 'Oct 23, 2023, 11:20 AM', vehicle: 'Volvo FH16 (TRK-902)', trip: 'Trip #1019', liters: '420.0 L', cost: '$672.00' },
  { id: 5, date: 'Oct 22, 2023, 09:10 AM', vehicle: 'Mercedes Sprinter (VAN-015)', trip: 'Trip #1015', liters: '75.0 L', cost: '$120.00' },
];

const mockExpenses = [
  { id: 1, date: 'Oct 24, 2023', vehicle: 'Volvo FH16 (TRK-902)', type: 'Tolls', amount: '$45.00', desc: 'A1 Motorway Transit' },
  { id: 2, date: 'Oct 23, 2023', vehicle: 'Mercedes Sprinter (VAN-015)', type: 'Cleaning', amount: '$22.50', desc: 'Full exterior wash' },
  { id: 3, date: 'Oct 22, 2023', vehicle: 'General Fleet', type: 'Parking', amount: '$120.00', desc: 'Monthly Depot Lease - Overflow' },
  { id: 4, date: 'Oct 21, 2023', vehicle: 'Scania R450 (TRK-771)', type: 'Repair', amount: '$340.00', desc: 'Emergency tire replacement' },
  { id: 5, date: 'Oct 20, 2023', vehicle: 'Office', type: 'Other', amount: '$12.99', desc: 'Fleet Manager Stationery' },
];

const Fuel = () => {
  const [activeTab, setActiveTab] = useState('fuel');
  
  return (
    <div className="space-y-lg">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-md">
        <div className="inline-flex p-1 bg-surface-container rounded-xl border border-outline-variant">
          <button 
            className={`px-6 py-2 rounded-lg font-label-md text-label-md transition-all-custom ${activeTab === 'fuel' ? 'bg-surface-container-lowest text-primary shadow-sm border border-outline-variant/20' : 'text-secondary hover:text-primary'}`}
            onClick={() => setActiveTab('fuel')}
          >
            Fuel logs
          </button>
          <button 
            className={`px-6 py-2 rounded-lg font-label-md text-label-md transition-all-custom ${activeTab === 'expenses' ? 'bg-surface-container-lowest text-primary shadow-sm border border-outline-variant/20' : 'text-secondary hover:text-primary'}`}
            onClick={() => setActiveTab('expenses')}
          >
            Other expenses
          </button>
        </div>
        <div>
          {activeTab === 'fuel' && (
            <div className="flex items-center gap-md">
              <button className="bg-primary text-on-primary px-4 py-2 rounded-lg font-label-md text-label-md hover:opacity-90 transition-all flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">local_gas_station</span>
                Add fuel log
              </button>
              <button className="border border-outline-variant bg-surface-container-lowest text-secondary px-4 py-2 rounded-lg font-label-md text-label-md hover:bg-surface-container-high transition-all flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">download</span>
                Export CSV
              </button>
            </div>
          )}
          {activeTab === 'expenses' && (
            <div className="flex items-center gap-md">
              <button className="bg-primary text-on-primary px-4 py-2 rounded-lg font-label-md text-label-md hover:opacity-90 transition-all flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                Add expense
              </button>
              <button className="border border-outline-variant bg-surface-container-lowest text-secondary px-4 py-2 rounded-lg font-label-md text-label-md hover:bg-surface-container-high transition-all flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">download</span>
                Export CSV
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-lg">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex flex-col justify-between">
          <span className="text-label-sm font-label-sm text-secondary uppercase tracking-wider">Total Fuel Spend (MTD)</span>
          <div className="mt-md flex items-baseline gap-2">
            <span className="text-headline-lg font-headline-lg text-on-surface">$12,450.00</span>
            <span className="text-label-sm font-label-sm text-error flex items-center">
              <span className="material-symbols-outlined text-[14px]">arrow_upward</span> 4.2%
            </span>
          </div>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex flex-col justify-between">
          <span className="text-label-sm font-label-sm text-secondary uppercase tracking-wider">Fuel Consumption</span>
          <div className="mt-md flex items-baseline gap-2">
            <span className="text-headline-lg font-headline-lg text-on-surface">8,920 L</span>
            <span className="text-label-sm font-label-sm text-primary flex items-center">
              <span className="material-symbols-outlined text-[14px]">arrow_downward</span> 1.8%
            </span>
          </div>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex flex-col justify-between">
          <span className="text-label-sm font-label-sm text-secondary uppercase tracking-wider">Other Expenses</span>
          <div className="mt-md flex items-baseline gap-2">
            <span className="text-headline-lg font-headline-lg text-on-surface">$3,120.45</span>
            <span className="text-label-sm font-label-sm text-secondary">vs $2.9k prev</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex flex-col justify-between">
          <span className="text-label-sm font-label-sm text-secondary uppercase tracking-wider">Active Fleet</span>
          <div className="mt-md flex items-baseline gap-2">
            <span className="text-headline-lg font-headline-lg text-on-surface">42/45</span>
            <div className="w-16 h-1.5 bg-surface-container rounded-full overflow-hidden ml-auto">
              <div className="w-[93%] h-full bg-primary"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden min-h-[500px]">
        {activeTab === 'fuel' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant">
                  <th className="px-lg py-4 font-label-md text-label-md text-secondary">Date</th>
                  <th className="px-lg py-4 font-label-md text-label-md text-secondary">Vehicle</th>
                  <th className="px-lg py-4 font-label-md text-label-md text-secondary">Trip</th>
                  <th className="px-lg py-4 font-label-md text-label-md text-secondary">Liters</th>
                  <th className="px-lg py-4 font-label-md text-label-md text-secondary">Cost</th>
                  <th className="px-lg py-4 font-label-md text-label-md text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {mockFuel.map(f => (
                  <tr key={f.id} className="hover:bg-surface-container transition-colors group">
                    <td className="px-lg py-4 font-body-md text-body-md">{f.date}</td>
                    <td className="px-lg py-4 font-body-md font-medium">{f.vehicle}</td>
                    <td className="px-lg py-4">
                      {f.trip.includes('No') ? (
                        <span className="px-2 py-0.5 bg-surface-container-highest text-secondary text-label-sm rounded italic">{f.trip}</span>
                      ) : (
                        <span className="px-2 py-0.5 bg-secondary-container text-on-secondary-container text-label-sm rounded uppercase">{f.trip}</span>
                      )}
                    </td>
                    <td className="px-lg py-4 font-body-md text-body-md">{f.liters}</td>
                    <td className="px-lg py-4 font-body-md font-bold text-primary">{f.cost}</td>
                    <td className="px-lg py-4">
                      <button className="p-1 text-secondary hover:text-primary transition-colors opacity-0 group-hover:opacity-100">
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant">
                  <th className="px-lg py-4 font-label-md text-label-md text-secondary">Date</th>
                  <th className="px-lg py-4 font-label-md text-label-md text-secondary">Vehicle</th>
                  <th className="px-lg py-4 font-label-md text-label-md text-secondary">Type</th>
                  <th className="px-lg py-4 font-label-md text-label-md text-secondary">Amount</th>
                  <th className="px-lg py-4 font-label-md text-label-md text-secondary">Description</th>
                  <th className="px-lg py-4 font-label-md text-label-md text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {mockExpenses.map(e => (
                  <tr key={e.id} className="hover:bg-surface-container transition-colors group">
                    <td className="px-lg py-4 font-body-md text-body-md">{e.date}</td>
                    <td className="px-lg py-4 font-body-md font-medium">{e.vehicle}</td>
                    <td className="px-lg py-4">
                      <span className={`px-2 py-0.5 text-label-sm rounded uppercase font-bold ${e.type === 'Repair' ? 'bg-error/10 text-error' : e.type === 'Other' ? 'bg-surface-container-highest text-secondary' : 'bg-tertiary-container/10 text-tertiary'}`}>
                        {e.type}
                      </span>
                    </td>
                    <td className="px-lg py-4 font-body-md font-bold">{e.amount}</td>
                    <td className="px-lg py-4 font-body-md text-secondary italic">{e.desc}</td>
                    <td className="px-lg py-4">
                      <button className="p-1 text-secondary hover:text-primary transition-colors opacity-0 group-hover:opacity-100">
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Fuel;
