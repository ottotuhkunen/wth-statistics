// src/services/airtable.js
import axios from 'axios';

const baseURL = `https://api.airtable.com/v0/${process.env.REACT_APP_AIRTABLE_BASE_ID}/tblTVroUgAbyIFCCG`;

const airtableAPI = axios.create({
  baseURL,
  headers: {
    Authorization: `Bearer ${process.env.REACT_APP_AIRTABLE_PAT}`,
  },
});

export const fetchEventData = async () => {
  try {
    const response = await airtableAPI.get();
    return response.data.records.map(record => {
      const atcoField = record.fields.ATCO || ''; // Default to empty string if undefined
      return {
        date: record.fields.Date,
        departures: record.fields.Departures,
        arrivals: record.fields.Arrivals,
        config: record.fields.Config,
        atco: atcoField.split(',').map(Number), // Convert ATCO to an array of numbers
      };
    });
  } catch (error) {
    console.error('Error fetching data from Airtable', error);
    return []; // Return an empty array in case of error
  }
};
