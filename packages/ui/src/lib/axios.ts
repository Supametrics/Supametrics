import axios, { AxiosInstance, AxiosResponse } from "axios";
import { Response } from "../types";

const axiosFetch: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL + "/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

axiosFetch.interceptors.response.use(
  (response: AxiosResponse<Response>) => response,
  (error) => {
    let message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.response?.data?.detail ||
      error.message ||
      "Something went wrong";

    if (error.code === "ERR_NETWORK") {
      message = "Unable to connect to server. Please check your internet.";
    }

    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      window.location.href = "/login";
      return Promise.reject(new Error("Session expired. Redirecting to login."));
    }

    return Promise.reject(new Error(message));
  }
);

export default axiosFetch;
