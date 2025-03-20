'use client';

import { useState, useEffect } from 'react';
import { FaPlus, FaTimes } from 'react-icons/fa';

export default function SetupModal({ onClose, onSave, setup, availablePlants, isNew }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    plantIds: []
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Initialize form data when editing an existing setup
  useEffect(() => {
    if (setup) {
      setFormData({
        name: setup.name || '',
        description: setup.description || '',
        plantIds: setup.plants ? setup.plants.map(plant => plant.id) : []
      });
    }
  }, [setup]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handlePlantToggle = (plantId) => {
    setFormData(prev => {
      const plantIds = prev.plantIds.includes(plantId)
        ? prev.plantIds.filter(id => id !== plantId)
        : [...prev.plantIds, plantId];
      
      return {
        ...prev,
        plantIds
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name.trim()) {
      alert('Bitte gib einen Namen für das Setup ein.');
      return;
    }
    
    onSave(formData);
  };

  // Filter plants based on search term
  const filteredPlants = availablePlants.filter(plant => 
    plant.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center border-b px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {isNew ? 'Neues Setup erstellen' : 'Setup bearbeiten'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-4rem)]">
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-primary"
              placeholder="Name des Setups"
              required
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
              Beschreibung (optional)
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-primary"
              placeholder="Beschreibung des Setups"
              rows="3"
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Pflanzen auswählen
            </label>
            <div className="border border-gray-300 rounded mb-3">
              <div className="px-3 py-2 border-b">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-2 py-1 border-none focus:outline-none"
                  placeholder="Pflanzen suchen..."
                />
              </div>
              <div className="max-h-48 overflow-y-auto p-1">
                {filteredPlants.length === 0 ? (
                  <p className="text-gray-500 text-center p-4">Keine Pflanzen gefunden</p>
                ) : (
                  filteredPlants.map(plant => (
                    <div 
                      key={plant.id}
                      className={`flex items-center p-2 hover:bg-gray-50 rounded-md cursor-pointer ${
                        formData.plantIds.includes(plant.id) ? 'bg-green-50' : ''
                      }`}
                      onClick={() => handlePlantToggle(plant.id)}
                    >
                      <input
                        type="checkbox"
                        checked={formData.plantIds.includes(plant.id)}
                        onChange={() => {}}
                        className="mr-3"
                      />
                      <div>
                        <p className="font-medium text-gray-800">{plant.name}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(plant.start_date).toLocaleDateString('de-DE')}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <p className="text-sm text-gray-600">
              {formData.plantIds.length} Pflanzen ausgewählt
            </p>
          </div>
          
          <div className="flex justify-end space-x-3 border-t pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-primary text-white rounded hover:bg-primary-hover flex items-center gap-2"
            >
              <FaPlus className="text-sm" />
              {isNew ? 'Setup erstellen' : 'Setup speichern'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
