'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname, useParams } from 'next/navigation';
import Link from 'next/link';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('strains'); // 'strains' or 'users' or 'feedback'

  const router = useRouter();
  
  // Strain management state
  const [strains, setStrains] = useState([]);
  const [editingStrain, setEditingStrain] = useState(null);
  const [newStrain, setNewStrain] = useState({
    name: '',
    type: '',
    thc: '',
    cbd: '',
    flowering_time: '',
    description: '',
    effects: []
  });
  
  // User management state
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({
    username: '',
    password: ''
  });

  // Feedback management state
  const [feedback, setFeedback] = useState([]);

  useEffect(() => {
    if (activeTab === 'strains') {
      loadStrains();
    } else if (activeTab === 'users') {
      loadUsers();
    } else if (activeTab === 'feedback') {
      loadFeedback();
    }
  }, [activeTab]);

  // Strain management functions
  const loadStrains = async () => {
    try {
      const response = await fetch('/api/strains');
      const data = await response.json();
      if (data && data.strains) {
        setStrains(data.strains);
      } else {
        console.error('Invalid strain data format:', data);
        setStrains([]);
      }
    } catch (error) {
      console.error('Error loading strains:', error);
      setStrains([]);
    }
  };

  const handleSaveStrain = async (strain) => {
    try {
      const response = await fetch('/api/strains', {
        method: strain.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(strain)
      });
      
      if (response.ok) {
        loadStrains();
        setEditingStrain(null);
        if (!strain.id) {
          setNewStrain({
            name: '',
            type: '',
            thc: '',
            cbd: '',
            flowering_time: '',
            description: '',
            effects: []
          });
        }
      }
    } catch (error) {
      console.error('Error saving strain:', error);
    }
  };

  const handleDeleteStrain = async (id) => {
    if (!confirm('Are you sure you want to delete this strain?')) return;
    
    try {
      const response = await fetch(`/api/strains?id=${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        loadStrains();
      }
    } catch (error) {
      console.error('Error deleting strain:', error);
    }
  };

  const handleEffectsChange = (value, strain) => {
    const effects = value.split(',').map(effect => effect.trim());
    if (editingStrain) {
      setEditingStrain({ ...strain, effects });
    } else {
      setNewStrain({ ...newStrain, effects });
    }
  };

  // User management functions
  const loadUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      if (data && data.users) {
        setUsers(data.users);
      } else {
        console.error('Invalid user data format:', data);
        setUsers([]);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
    }
  };

  const handleSaveUser = async (user) => {
    try {
      const response = await fetch('/api/users', {
        method: user.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });
      
      if (response.ok) {
        loadUsers();
        setEditingUser(null);
        if (!user.id) {
          setNewUser({
            username: '',
            password: ''
          });
        }
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const response = await fetch(`/api/users?id=${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        loadUsers();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  // Feedback management functions
  const loadFeedback = async () => {
    try {
      const response = await fetch('/api/feedback');
      const data = await response.json();
      if (data && data.feedback) {
        setFeedback(data.feedback);
      } else {
        console.error('Invalid feedback data format:', data);
        setFeedback([]);
      }
    } catch (error) {
      console.error('Error loading feedback:', error);
      setFeedback([]);
    }
  };

  const handleDeleteFeedback = async (id) => {
    if (!confirm('Bist du sicher, dass du dieses Feedback löschen möchtest?')) return;
    
    try {
      const response = await fetch(`/api/feedback?id=${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        loadFeedback();
      }
    } catch (error) {
      console.error('Error deleting feedback:', error);
    }
  };

  // Form components
  const StrainForm = ({ strain, onSave, onCancel }) => (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Name"
        className="w-full p-2 border rounded focus:border-custom-orange focus:ring-1 focus:ring-custom-orange"
        value={strain.name}
        onChange={(e) => strain.id ? 
          setEditingStrain({ ...strain, name: e.target.value }) :
          setNewStrain({ ...strain, name: e.target.value })}
      />
      <select
        className="w-full p-2 border rounded focus:border-custom-orange focus:ring-1 focus:ring-custom-orange"
        value={strain.type}
        onChange={(e) => strain.id ?
          setEditingStrain({ ...strain, type: e.target.value }) :
          setNewStrain({ ...strain, type: e.target.value })}
      >
        <option value="">Select Type</option>
        <option value="Sativa-dominant">Sativa-dominant</option>
        <option value="Indica-dominant">Indica-dominant</option>
        <option value="Hybrid">Hybrid</option>
      </select>
      <input
        type="text"
        placeholder="THC %"
        className="w-full p-2 border rounded focus:border-custom-orange focus:ring-1 focus:ring-custom-orange"
        value={strain.thc}
        onChange={(e) => strain.id ?
          setEditingStrain({ ...strain, thc: e.target.value }) :
          setNewStrain({ ...strain, thc: e.target.value })}
      />
      <input
        type="text"
        placeholder="CBD %"
        className="w-full p-2 border rounded focus:border-custom-orange focus:ring-1 focus:ring-custom-orange"
        value={strain.cbd}
        onChange={(e) => strain.id ?
          setEditingStrain({ ...strain, cbd: e.target.value }) :
          setNewStrain({ ...strain, cbd: e.target.value })}
      />
      <input
        type="number"
        placeholder="Flowering Time (days)"
        className="w-full p-2 border rounded focus:border-custom-orange focus:ring-1 focus:ring-custom-orange"
        value={strain.flowering_time}
        onChange={(e) => strain.id ?
          setEditingStrain({ ...strain, flowering_time: parseInt(e.target.value) }) :
          setNewStrain({ ...strain, flowering_time: parseInt(e.target.value) })}
      />
      <textarea
        placeholder="Description"
        className="w-full p-2 border rounded focus:border-custom-orange focus:ring-1 focus:ring-custom-orange"
        rows="3"
        value={strain.description}
        onChange={(e) => strain.id ?
          setEditingStrain({ ...strain, description: e.target.value }) :
          setNewStrain({ ...strain, description: e.target.value })}
      />
      <input
        type="text"
        placeholder="Effects (comma-separated)"
        className="w-full p-2 border rounded focus:border-custom-orange focus:ring-1 focus:ring-custom-orange"
        value={strain.effects.join(', ')}
        onChange={(e) => handleEffectsChange(e.target.value, strain)}
      />
      <div className="flex gap-2">
        <button
          className="px-4 py-2 text-white bg-custom-orange rounded hover:bg-custom-orange/90"
          onClick={() => onSave(strain)}
        >
          {strain.id ? 'Save Changes' : 'Add Strain'}
        </button>
        {onCancel && (
          <button
            className="px-4 py-2 text-custom-orange bg-custom-orange/10 rounded hover:bg-custom-orange/20"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );

  // User form has been directly implemented in the user management section

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold font-aptos mb-4">Admin Dashboard</h1>
      
      {/* Tab Navigation */}
      <div className="flex border-b border-custom-orange mb-8">
        <button
          className={`px-6 py-3 font-medium ${
            activeTab === 'strains'
              ? 'text-custom-orange border-b-2 border-custom-orange'
              : 'text-gray-500 hover:text-custom-orange'
          }`}
          onClick={() => setActiveTab('strains')}
        >
          Workshop Samen
        </button>
        <button
          className={`px-6 py-3 font-medium ${
            activeTab === 'users'
              ? 'text-custom-orange border-b-2 border-custom-orange'
              : 'text-gray-500 hover:text-custom-orange'
          }`}
          onClick={() => setActiveTab('users')}
        >
          Benutzerverwaltung
        </button>
        <button
          className={`px-6 py-3 font-medium ${
            activeTab === 'feedback'
              ? 'text-custom-orange border-b-2 border-custom-orange'
              : 'text-gray-500 hover:text-custom-orange'
          }`}
          onClick={() => setActiveTab('feedback')}
        >
          Feedback
        </button>
        <button
          className={`px-6 py-3 font-medium ${
            activeTab === 'help-requests'
              ? 'text-custom-orange border-b-2 border-custom-orange'
              : 'text-gray-500 hover:text-custom-orange'
          }`}
          onClick={() => router.push('/admin/help-requests')}
        >
          Hilfe-Anfragen
        </button>
        <Link 
          href="/admin/database"
          className={`px-6 py-3 font-medium ${
            activeTab === 'database'
              ? 'text-custom-orange border-b-2 border-custom-orange'
              : 'text-gray-500 hover:text-custom-orange'
          }`}
        >
          Datenbank
        </Link>

      </div>
      
      {/* Strain Management Section */}
      {activeTab === 'strains' && (
        <>
          <div className="bg-custom-orange text-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold font-aptos mb-4">Add New Strain</h2>
            <StrainForm strain={newStrain} onSave={handleSaveStrain} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {strains && strains.length > 0 && strains.map(strain => (
              <div key={strain.id} className="bg-custom-orange text-white rounded-lg shadow-md p-6">
                {editingStrain?.id === strain.id ? (
                  <StrainForm
                    strain={editingStrain}
                    onSave={handleSaveStrain}
                    onCancel={() => setEditingStrain(null)}
                  />
                ) : (
                  <>
                    <h3 className="text-xl font-bold font-aptos mb-4">{strain.name}</h3>
                    <div className="space-y-2 text-white/80">
                      <p><span className="font-semibold text-white/90">Type:</span> {strain.type}</p>
                      <p><span className="font-semibold text-white/90">THC:</span> {strain.thc}</p>
                      <p><span className="font-semibold text-white/90">CBD:</span> {strain.cbd}</p>
                      <p><span className="font-semibold text-white/90">Flowering Time:</span> {strain.flowering_time} days</p>
                      <p><span className="font-semibold text-white/90">Description:</span> {strain.description}</p>
                      <p><span className="font-semibold text-white/90">Effects:</span> {strain.effects.join(', ')}</p>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button
                        className="px-4 py-2 text-custom-orange bg-white rounded hover:bg-white/90"
                        onClick={() => setEditingStrain(strain)}
                      >
                        Edit
                      </button>
                      <button
                        className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700"
                        onClick={() => handleDeleteStrain(strain.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
            {(!strains || strains.length === 0) && (
              <div className="col-span-3 text-center py-8 text-white/70">
                No strains found. Add a new strain above.
              </div>
            )}
          </div>
        </>
      )}
      
      {/* User Management Section */}
      {activeTab === 'users' && (
        <>
          <div className="bg-custom-orange text-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold font-aptos mb-4">Add New User</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Username"
                className="w-full p-2 border rounded text-black focus:border-custom-orange focus:ring-1 focus:ring-custom-orange"
                value={newUser.username}
                onChange={(e) => setNewUser(prev => ({ ...prev, username: e.target.value }))}
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full p-2 border rounded text-black focus:border-custom-orange focus:ring-1 focus:ring-custom-orange"
                value={newUser.password || ''}
                onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
              />
              <div className="flex gap-2">
                <button
                  className="px-4 py-2 text-white bg-custom-orange rounded hover:bg-custom-orange/90"
                  onClick={() => handleSaveUser(newUser)}
                >
                  Add User
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users && users.length > 0 && users.map(user => (
              <div key={user.id} className="bg-custom-orange text-white rounded-lg shadow-md p-6">
                {editingUser?.id === user.id ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Username"
                      className="w-full p-2 border rounded text-black focus:border-custom-orange focus:ring-1 focus:ring-custom-orange"
                      value={editingUser.username}
                      onChange={(e) => setEditingUser(prev => ({ ...prev, username: e.target.value }))}
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      className="w-full p-2 border rounded text-black focus:border-custom-orange focus:ring-1 focus:ring-custom-orange"
                      value={editingUser.password || ''}
                      onChange={(e) => setEditingUser(prev => ({ ...prev, password: e.target.value }))}
                    />
                    <p className="text-sm text-white/70">Leave password blank to keep current password</p>
                    <div className="flex gap-2">
                      <button
                        className="px-4 py-2 text-white bg-custom-orange rounded hover:bg-custom-orange/90"
                        onClick={() => handleSaveUser(editingUser)}
                      >
                        Save Changes
                      </button>
                      <button
                        className="px-4 py-2 text-custom-orange bg-custom-orange/10 rounded hover:bg-custom-orange/20"
                        onClick={() => setEditingUser(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="text-xl font-bold font-aptos mb-4">{user.username}</h3>
                    <div className="space-y-2 text-white/80">
                      <p><span className="font-semibold text-white/90">Created:</span> {new Date(user.created_at).toLocaleDateString()}</p>
                      {/* Onboarding status removed */}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button
                        className="px-4 py-2 text-custom-orange bg-white rounded hover:bg-white/90"
                        onClick={() => setEditingUser(user)}
                      >
                        Edit
                      </button>
                      <button
                        className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
            {(!users || users.length === 0) && (
              <div className="col-span-3 text-center py-8 text-white/70">
                No users found. Add a new user above.
              </div>
            )}
          </div>
        </>
      )}
      
      {/* Feedback Management Section */}
      {activeTab === 'feedback' && (
        <>
          <h2 className="text-2xl font-bold font-aptos mb-6">Beta-Feedback</h2>
          <div className="grid grid-cols-1 gap-6">
            {feedback && feedback.length > 0 && feedback.map(feedbackItem => (
              <div key={feedbackItem.id} className="bg-white border border-gray-200 rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {feedbackItem.username}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      {new Date(feedbackItem.created_at).toLocaleString('de-DE')}
                    </p>
                    {feedbackItem.route && (
                      <p className="text-xs text-gray-500 mb-2">
                        <span className="font-medium">Seite:</span> {feedbackItem.route}
                      </p>
                    )}
                  </div>
                  <button
                    className="px-3 py-1 text-white bg-red-600 rounded hover:bg-red-700 text-sm"
                    onClick={() => handleDeleteFeedback(feedbackItem.id)}
                  >
                    Löschen
                  </button>
                </div>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-800 whitespace-pre-wrap">{feedbackItem.message}</p>
                </div>
              </div>
            ))}
            {(!feedback || feedback.length === 0) && (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-500">Noch kein Feedback vorhanden.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
