import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL;

export const getSubjects = async () => {
    const response = await axios.get(`${BASE_URL}/subjects`);
    return response.data;
};

export const addSubject = async (event) => {
    const response = await axios.post(`${BASE_URL}/subjects`, event);
    return response.data;
};