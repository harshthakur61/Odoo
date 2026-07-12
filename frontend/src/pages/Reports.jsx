import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_BASE = 'http://localhost:5000';

const Reports = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get(`${API_BASE}/api/emergency-reports`);
      setReports(res.data || []);
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to load emergency reports');
    } finally {
      setLoading(false);
    }
  };

  const updateReportStatus = async (reportId, newStatus) => {
    try {
      await axios.put(`${API_BASE}/api/emergency-reports/${reportId}/status`, { status: newStatus });
      await fetchReports();
    } catch (e) {
      alert('Failed to update status: ' + (e.response?.data?.error || 'Unknown error'));
    }
  };

  useEffect(() => {
    if (user) fetchReports();
  }, [user]);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-red-100 text-red-800';
      case 'REVIEWED':
        return 'bg-yellow-100 text-yellow-800';
      case 'RESOLVED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md mb-lg">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Emergency Reports</h2>
          <p className="text-body-md text-on-surface-variant mt-1">Review and manage emergency reports from drivers</p>
        </div>
        <button
          onClick={fetchReports}
          className="bg-primary text-white px-lg py-md rounded-lg font-label-md flex items-center gap-sm hover:brightness-110 active:scale-95 transition-all shadow-sm"
        >
          <span className="material-symbols-outlined">refresh</span>
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-md bg-error/5 border border-error/20 rounded-lg text-body-md text-error">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-xl text-body-md text-secondary">Loading reports...</div>
      ) : reports.length === 0 ? (
        <div className="text-center py-xl bg-surface-container-lowest border border-outline-variant rounded-lg">
          <span className="material-symbols-outlined text-[48px] text-secondary mb-4 block">check_circle</span>
          <h3 className="font-headline-md text-headline-md text-on-surface mb-2">No emergency reports</h3>
          <p className="text-body-md text-on-surface-variant">Great! There are no active emergency reports at the moment.</p>
        </div>
      ) : (
        <div className="space-y-md">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-md mb-md">
                <div>
                  <div className="flex items-center gap-sm mb-sm">
                    <span className="material-symbols-outlined text-red-500">emergency</span>
                    <span className="font-headline-md text-headline-md text-on-surface">
                      Trip {report.tripId} - {report.driver?.name || 'Unknown Driver'}
                    </span>
                  </div>
                  <p className="text-label-sm text-secondary">
                    {new Date(report.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-sm">
                  <span className={`px-2 py-1 rounded-full text-label-sm font-bold ${getStatusBadgeClass(report.status)}`}>
                    {report.status}
                  </span>
                  {report.status !== 'RESOLVED' && (
                    <select
                      className="border border-outline-variant rounded-lg px-2 py-1 text-label-sm"
                      value={report.status}
                      onChange={(e) => updateReportStatus(report.id, e.target.value)}
                    >
                      <option value="PENDING">Pending</option>
                      <option value="REVIEWED">Reviewed</option>
                      <option value="RESOLVED">Resolved</option>
                    </select>
                  )}
                </div>
              </div>

              <div className="space-y-sm border-t border-outline-variant pt-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-sm">
                  <div>
                    <p className="text-label-sm font-bold text-secondary">Vehicle</p>
                    <p className="text-body-md text-on-surface">{report.trip?.vehicle?.regNumber || '-'}</p>
                  </div>
                  <div>
                    <p className="text-label-sm font-bold text-secondary">Route</p>
                    <p className="text-body-md text-on-surface">{report.trip?.source} → {report.trip?.destination}</p>
                  </div>
                </div>
                <div>
                  <p className="text-label-sm font-bold text-secondary mb-sm">Details</p>
                  <p className="text-body-md text-on-surface p-md bg-surface-container rounded-lg">
                    {report.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reports;
