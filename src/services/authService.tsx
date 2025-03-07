import { createAsyncThunk } from "@reduxjs/toolkit";
import { publicRequest } from "../services/api";

export const loginUser = createAsyncThunk(
    "auth/login",
    async (credentials: { email: string; password: string }, { rejectWithValue }) => {
        try {
            const response = await publicRequest.post("/auth/login", credentials);
            return response.data;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Login failed");
        }
    }
);
