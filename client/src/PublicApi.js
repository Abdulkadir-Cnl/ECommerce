// src/PublicApi.js
import axios from "axios";

const publicApi = axios.create({
  baseURL: "https://localhost:7011/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default publicApi;
