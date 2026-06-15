import axios from "axios";

const API = axios.create({
baseURL: "http://localhost:5000/api",
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
