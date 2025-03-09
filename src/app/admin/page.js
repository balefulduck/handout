'use client';

import { useState, useEffect } from 'react';

export default function AdminPage() {
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

  useEffect(() => {
    loadStrains();
  }, []);

  const loadStrains = async () => {
    try {
      const response = await fetch('/api/strains');
      const data = await response.json();
      setStrains(data.strains);
    } catch (error) {
      console.error('Error loading strains:', error);
    }
  };

  const handleSave = async (strain) => {
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

  const handleDelete = async (id) => {
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

  const StrainForm = ({ strain, onSave, onCancel }) => (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Name"
        className="w-full p-2 border rounded"
        value={strain.name}
        onChange={(e) => strain.id ? 
          setEditingStrain({ ...strain, name: e.target.value }) :
          setNewStrain({ ...strain, name: e.target.value })}
      />
      <select
        className="w-full p-2 border rounded"
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
        className="w-full p-2 border rounded"
        value={strain.thc}
        onChange={(e) => strain.id ?
          setEditingStrain({ ...strain, thc: e.target.value }) :
          setNewStrain({ ...strain, thc: e.target.value })}
      />
      <input
        type="text"
        placeholder="CBD %"
        className="w-full p-2 border rounded"
        value={strain.cbd}
        onChange={(e) => strain.id ?
          setEditingStrain({ ...strain, cbd: e.target.value }) :
          setNewStrain({ ...strain, cbd: e.target.value })}
      />
      <input
        type="number"
        placeholder="Flowering Time (days)"
        className="w-full p-2 border rounded"
        value={strain.flowering_time}
        onChange={(e) => strain.id ?
          setEditingStrain({ ...strain, flowering_time: parseInt(e.target.value) }) :
          setNewStrain({ ...strain, flowering_time: parseInt(e.target.value) })}
      />
      <textarea
        placeholder="Description"
        className="w-full p-2 border rounded"
        rows="3"
        value={strain.description}
        onChange={(e) => strain.id ?
          setEditingStrain({ ...strain, description: e.target.value }) :
          setNewStrain({ ...strain, description: e.target.value })}
      />
      <input
        type="text"
        placeholder="Effects (comma-separated)"
        className="w-full p-2 border rounded"
        value={strain.effects.join(', ')}
        onChange={(e) => handleEffectsChange(e.target.value, strain)}
      />
      <div className="flex gap-2">
        <button
          className="px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700"
          onClick={() => onSave(strain)}
        >
          {strain.id ? 'Save Changes' : 'Add Strain'}
        </button>
        {onCancel && (
          <button
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Strain Management</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Add New Strain</h2>
        <StrainForm strain={newStrain} onSave={handleSave} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {strains.map(strain => (
          <div key={strain.id} className="bg-white rounded-lg shadow-md p-6">
            {editingStrain?.id === strain.id ? (
              <StrainForm
                strain={editingStrain}
                onSave={handleSave}
                onCancel={() => setEditingStrain(null)}
              />
            ) : (
              <>
                <h3 className="text-xl font-semibold mb-4">{strain.name}</h3>
                <div className="space-y-2 text-gray-600">
                  <p><span className="font-medium">Type:</span> {strain.type}</p>
                  <p><span className="font-medium">THC:</span> {strain.thc}</p>
                  <p><span className="font-medium">CBD:</span> {strain.cbd}</p>
                  <p><span className="font-medium">Flowering Time:</span> {strain.flowering_time} days</p>
                  <p><span className="font-medium">Description:</span> {strain.description}</p>
                  <p><span className="font-medium">Effects:</span> {strain.effects.join(', ')}</p>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
                    onClick={() => setEditingStrain(strain)}
                  >
                    Edit
                  </button>
                  <button
                    className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700"
                    onClick={() => handleDelete(strain.id)}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
