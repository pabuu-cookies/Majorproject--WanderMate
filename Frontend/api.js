import axios from "axios";

const api = axios.create({
  baseURL: "http://192.168.1.65:5500",
  timeout: 10000,
});

export default api;
