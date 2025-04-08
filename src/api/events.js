import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL;

export const getEvents = async () => {
    const response = await axios.get(`${BASE_URL}/events`);
    return response.data;
};

export const addEvent = async (event) => {
    const response = await axios.post(`${BASE_URL}/events`, event);
    return response.data;
};