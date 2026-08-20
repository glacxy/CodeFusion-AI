import axios from "axios";
import { API_PREFIX } from "../config";

const API = axios.create({
  baseURL: API_PREFIX,
});

export const createRoom = (roomData, token) => {
return API.post("/rooms/create", roomData, {
headers: {
Authorization: `Bearer ${token}`,
},
});
};

export const getRooms = (token) => {
return API.get("/rooms", {
headers: {
Authorization: `Bearer ${token}`,
}, 
});
};
