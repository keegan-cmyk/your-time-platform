import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL
});

export async function authHeader() {
  const token = localStorage.getItem("sb-access-token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}
