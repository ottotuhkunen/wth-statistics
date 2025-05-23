// Instead of axios and airtableAPI
import eventData from '../utils/data.json';

export const fetchEventData = async () => {
  try {
    // Since it's static and local, we just return it directly
    return eventData;
  } catch (error) {
    console.error('Error loading local event data:', error);
    return [];
  }
};
