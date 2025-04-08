import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL;

export const getTasks = async () => {
    const response = await axios.get(`${BASE_URL}/tasks`);
    return response.data;
};

export const addTask = async (task) => {
    const response = await axios.post(`${BASE_URL}/tasks`, task);
    return response.data;
};