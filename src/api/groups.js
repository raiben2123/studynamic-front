import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL;

export const getGroups = async () => {
    const response = await axios.get(`${BASE_URL}/groups`);
    return response.data;
};

export const getGroupById = async (groupId) => {
    const response = await axios.get(`${BASE_URL}/groups/${groupId}`);
    return response.data;
};

export const addGroupEvent = async (groupId, event) => {
    const response = await axios.post(`${BASE_URL}/groups/${groupId}/events`, event);
    return response.data;
};