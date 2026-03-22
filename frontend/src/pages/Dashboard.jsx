import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [records, setRecords] = useState([]);
  const [searchId, setSearchId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Doctor Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    diagnosis: '',
    prescription: '',
    allergies: '',
    ongoingMedications: '',
    notes: ''
  });

  useEffect(() => {
    if (user?.role === 'patient') {
      fetchRecords(user._id);
    }
  }, [user]);

  const fetchRecords = async (patientId) => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`http://localhost:5001/api/records/${patientId}`);
      setRecords(res.data);
      if (user?.role === 'doctor') {
        setShowAddForm(true); // show form once patient is found
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to fetch records');
      setRecords([]);
      setShowAddForm(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchId.trim()) {
      fetchRecords(searchId);
    }
  };

  const handleAddRecord = async (e) => {
    e.preventDefault();
    try {
      const formattedPrescription = formData.prescription.split(',').map(item => ({ medicineName: item.trim() }));
      const formattedAllergies = formData.allergies.split(',').map(a => a.trim());
      const formattedMeds = formData.ongoingMedications.split(',').map(m => m.trim());
      
      await axios.post('http://localhost:5001/api/records', {
        patientId: searchId,
        hospitalName: 'General Hospital', // placeholder for now
        diagnosis: formData.diagnosis,
        prescription: formattedPrescription,
        allergies: formattedAllergies,
        ongoingMedications: formattedMeds,
        notes: formData.notes
      });
      
      // Refresh list
      fetchRecords(searchId);
      setFormData({ diagnosis: '', prescription: '', allergies: '', ongoingMedications: '', notes: '' });
      setShowAddForm(false);
    } catch (err) {
      setError(err.response?.data?.msg || 'Error adding record');
    }
  };

  return (
    <div className="container dashboard-layout">
      <div className="dashboard-header">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            {user?.role === 'doctor' ? 'Doctor Portal' : 'My Health Records'}
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {user?.role === 'doctor' ? 'Lookup and update patient histories' : 'View your complete medical history across hospitals'}
          </p>
        </div>
      </div>

      {user?.role === 'doctor' && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <form style={{ display: 'flex', gap: '1rem' }} onSubmit={handleSearch}>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Enter Patient ID (e.g. 64b8f...)" 
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              style={{ flex: 1 }}
              required
            />
            <button type="submit" className="btn btn-primary">Lookup Patient</button>
          </form>
        </div>
      )}

      {error && <div className="card" style={{ borderColor: 'var(--danger)', color: 'var(--danger)', marginBottom: '1rem' }}>{error}</div>}

      {/* Add New Record Form (Doctors Only) */}
      {user?.role === 'doctor' && showAddForm && (
        <div className="card" style={{ marginBottom: '2rem', background: '#f8fafc' }}>
          <h3 style={{ marginBottom: '1rem' }}>Add New Record for Patient: {searchId}</h3>
          <form onSubmit={handleAddRecord}>
            <div className="form-group">
              <label className="form-label">Diagnosis</label>
              <input type="text" className="form-input" required value={formData.diagnosis} onChange={e => setFormData({...formData, diagnosis: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Prescription (comma separated)</label>
              <input type="text" className="form-input" value={formData.prescription} onChange={e => setFormData({...formData, prescription: e.target.value})} placeholder="e.g. Paracetamol, Amoxicillin" />
            </div>
            <div className="form-group">
              <label className="form-label">Allergies (comma separated)</label>
              <input type="text" className="form-input" value={formData.allergies} onChange={e => setFormData({...formData, allergies: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea className="form-input" rows="3" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}></textarea>
            </div>
            <button type="submit" className="btn btn-primary">Save Record</button>
            <button type="button" className="btn" style={{ marginLeft: '1rem' }} onClick={() => setShowAddForm(false)}>Cancel</button>
          </form>
        </div>
      )}

      {/* Record History */}
      {loading ? (
        <p>Loading records...</p>
      ) : records.length > 0 ? (
        <div className="grid-cols-2">
          {records.map(record => (
            <div key={record._id} className="card record-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span className="badge">{new Date(record.dateAdded).toLocaleDateString()}</span>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{record.hospitalName}</span>
              </div>
              <h3 style={{ marginBottom: '0.5rem' }}>{record.diagnosis}</h3>
              <div style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                <strong>Doctor:</strong> {record.doctor?.name} ({record.doctor?.specialization})
              </div>
              {record.prescription?.length > 0 && (
                <div style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  <strong>Prescriptions:</strong> {record.prescription.map(p => p.medicineName).join(', ')}
                </div>
              )}
              {record.notes && (
                <p style={{ fontSize: '0.875rem', marginTop: '0.5rem', padding: '0.5rem', background: 'var(--background)', borderRadius: 'var(--radius-sm)' }}>
                  {record.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p style={{ color: 'var(--text-secondary)' }}>
          {user?.role === 'patient' ? "No medical records found." : "Search for a patient to view their records."}
        </p>
      )}
    </div>
  );
};

export default Dashboard;
