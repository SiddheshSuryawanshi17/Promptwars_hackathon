import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [facilities, setFacilities] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [editingFacility, setEditingFacility] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_BASE = 'http://localhost:4000/api/admin';

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [facilitiesRes, analyticsRes] = await Promise.all([
        axios.get(`${API_BASE}/facilities`),
        axios.get(`${API_BASE}/analytics`)
      ]);
      setFacilities(facilitiesRes.data);
      setAnalytics(analyticsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleUpdateFacility = async (id, updates) => {
    try {
      await axios.post(`${API_BASE}/facilities/${id}/update`, updates);
      fetchData();
      setEditingFacility(null);
    } catch (error) {
      console.error('Error updating facility:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditingFacility({
      ...editingFacility,
      [name]: name === 'status' ? value : parseInt(value) || value
    });
  };

  if (loading) {
    return <div className="admin-loading">Loading...</div>;
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>👩‍💼 Admin Control Panel</h1>
        <button className="refresh-btn" onClick={fetchData}>
          🔄 Refresh
        </button>
      </header>

      {/* Analytics Cards */}
      {analytics && (
        <div className="analytics-grid">
          <div className="analytics-card">
            <h4>Total Facilities</h4>
            <p className="analytics-value">{analytics.totalFacilities}</p>
          </div>
          <div className="analytics-card">
            <h4>Avg Wait Time</h4>
            <p className="analytics-value">{analytics.avgWaitTime} min</p>
          </div>
          <div className="analytics-card">
            <h4>Overall Occupancy</h4>
            <p className="analytics-value">
              {Math.round((analytics.totalOccupancy / analytics.totalCapacity) * 100)}%
            </p>
          </div>
          <div className="analytics-card">
            <h4>Open Facilities</h4>
            <p className="analytics-value">{analytics.openFacilities}</p>
          </div>
        </div>
      )}

      {/* Facilities Table */}
      <div className="facilities-section">
        <h2>Facility Management</h2>
        <table className="facilities-table">
          <thead>
            <tr>
              <th>Facility</th>
              <th>Type</th>
              <th>Wait Time</th>
              <th>Occupancy</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {facilities.map(facility => (
              <tr key={facility.id}>
                <td className="facility-name">{facility.name}</td>
                <td>{facility.type}</td>
                <td>{facility.currentWaitTime} min</td>
                <td>
                  <progress
                    value={facility.currentOccupancy}
                    max={facility.maxCapacity}
                    title={`${facility.currentOccupancy}/${facility.maxCapacity}`}
                  />
                  {facility.currentOccupancy}/{facility.maxCapacity}
                </td>
                <td>
                  <span className={`status-badge ${facility.status}`}>
                    {facility.status}
                  </span>
                </td>
                <td>
                  <button
                    className="edit-btn"
                    onClick={() => setEditingFacility({ ...facility })}
                  >
                    ✏️ Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingFacility && (
        <div className="modal-overlay" onClick={() => setEditingFacility(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Update Facility</h2>
            <div className="form-group">
              <label>Wait Time (minutes)</label>
              <input
                type="number"
                name="currentWaitTime"
                value={editingFacility.currentWaitTime}
                onChange={handleInputChange}
                min="0"
              />
            </div>
            <div className="form-group">
              <label>Current Occupancy</label>
              <input
                type="number"
                name="currentOccupancy"
                value={editingFacility.currentOccupancy}
                onChange={handleInputChange}
                max={editingFacility.maxCapacity}
                min="0"
              />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select name="status" value={editingFacility.status} onChange={handleInputChange}>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
            <div className="modal-actions">
              <button
                className="save-btn"
                onClick={() =>
                  handleUpdateFacility(editingFacility.id, {
                    currentWaitTime: editingFacility.currentWaitTime,
                    currentOccupancy: editingFacility.currentOccupancy,
                    status: editingFacility.status
                  })
                }
              >
                💾 Save
              </button>
              <button
                className="cancel-btn"
                onClick={() => setEditingFacility(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
