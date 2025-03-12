/**
 * Utility functions to manage recently viewed plants
 */

const STORAGE_KEY = 'recentlyViewedPlants';
const MAX_PLANTS = 3;

/**
 * Add a plant to the recently viewed plants list
 * @param {Object} plant - Plant object with at least id and name
 */
export const addToRecentlyViewed = (plant) => {
  if (!plant || !plant.id || !plant.name) return;
  
  // Only run in browser environment
  if (typeof window === 'undefined') return;
  
  try {
    // Get existing list
    const existingDataStr = localStorage.getItem(STORAGE_KEY);
    const existingData = existingDataStr ? JSON.parse(existingDataStr) : [];
    
    // Remove plant if it already exists in the list (to move it to the top)
    const filteredData = existingData.filter(p => p.id !== plant.id);
    
    // Create simplified plant object with just the necessary info
    // Convert flowering_start_date to a boolean for simpler storage/retrieval
    const plantData = {
      id: plant.id,
      name: plant.name,
      isFlowering: plant.flowering_start_date ? true : false,
      timestamp: new Date().getTime()
    };
    
    // Add to beginning of array
    const updatedData = [plantData, ...filteredData].slice(0, MAX_PLANTS);
    
    // Save back to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
    
    // Clear the cache to force a fresh read next time
    localStorage.removeItem('recentlyViewedPlants_cache');
    
    return updatedData;
  } catch (error) {
    console.error('Error saving recently viewed plants:', error);
    return [];
  }
};

/**
 * Get the list of recently viewed plants
 * @returns {Array} - Array of plant objects
 */
export const getRecentlyViewedPlants = () => {
  // Only run in browser environment
  if (typeof window === 'undefined') return [];
  
  try {
    // Clear localStorage and start fresh (temporary fix)
    // localStorage.removeItem(STORAGE_KEY);
    // return [];
    
    const dataStr = localStorage.getItem(STORAGE_KEY);
    if (!dataStr) return [];
    
    const plants = JSON.parse(dataStr);
    return plants;
  } catch (error) {
    console.error('Error retrieving recently viewed plants:', error);
    return [];
  }
};

/**
 * Clear all recently viewed plants
 */
export const clearRecentlyViewedPlants = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
};
