import axios from "axios";
import { router } from "expo-router";
import { getItemAsync, deleteItemAsync } from "expo-secure-store";
import { Alert, Platform } from "react-native";

// Local IP address of the backend server within local network.
const baseURL = "10.140.104.210:8000";

export const api = axios.create({
  baseURL: `http://${baseURL}/api/v1`,
  timeout: 10000,
});

export function initiateInterceptors({ setIsSignedInState }) {
  api.interceptors.request.use(async (config) => {
    let token: string;

    if (Platform.OS !== "web") {
      token = await getItemAsync("token");
    } else {
      token = localStorage.getItem("token");
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  api.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      try {
        if (
          error?.response?.data.statusCode === 401 &&
          error?.response?.data.message === "Session Ended"
        ) {
          if (Platform.OS !== "web") {
            Alert.alert("Session ended", "Login again for new session");
            await deleteItemAsync("token");
          } else {
            window.alert("Session ended. Please login again for new session.");
            localStorage.removeItem("token");
          }

          setIsSignedInState(false);
          router.replace("/");
        } else {
          return Promise.reject(error);
        }
      } catch (error) {
        Platform.OS === "web"
          ? window.alert(
              "Network Error. Please check your internet or try signing in again!",
            )
          : Alert.alert(
              "Network Error",
              "Please check your internet or try signing in again!",
            );
        return Promise.reject(error);
      }
    },
  );
}
