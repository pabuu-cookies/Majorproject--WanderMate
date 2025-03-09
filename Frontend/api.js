import axios from "axios";

const api = axios.create({
  baseURL: "http://192.168.1.73:5500",
  timeout: 100000,
});

export default api;
