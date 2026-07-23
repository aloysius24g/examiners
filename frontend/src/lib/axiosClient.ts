import axios from "axios";

const apiClient = axios.create({
  //ATTENTION
  //also change the urls in hardcoded areas(in registerExaminer)
  baseURL: "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
  withCredentials: true
});

export default apiClient;
