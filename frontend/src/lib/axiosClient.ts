import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;
const apiClient = axios.create({
  //ATTENTION
  //also change the urls in hardcoded areas(in registerExaminer)
  baseURL: apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
  withCredentials: true
});

export default apiClient;
