import axios from "axios";
import { API_PREFIX } from "../config";

const API = axios.create({
  baseURL: API_PREFIX,
});

export const loginUser = (data) => API.post("/auth/login", data);

export const registerUser = (data) => API.post("/auth/register", data);
