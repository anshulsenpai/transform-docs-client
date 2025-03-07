import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define Auth State
export interface IUser {
    _id: string,
    name: string,
    email: string,
    password: string,
    gender: "male" | "female",
    role: "user" | "admin"
}

export interface AuthState {
    token: string | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    user: IUser | null;
    isAuthenticated: boolean;
}

// Initial State
const initialState: AuthState = {
    token: localStorage.getItem("access_token") || null,
    user: localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") as string) : null,
    isAuthenticated: !!localStorage.getItem("access_token"),
};

// Auth Slice
const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        loginSuccess: (state, action: PayloadAction<{ token: string; user: any }>) => {
            state.token = action.payload.token;
            state.user = action.payload.user;
            state.isAuthenticated = true;
            localStorage.setItem("access_token", action.payload.token);
            localStorage.setItem("user", JSON.stringify(action.payload.user));
        },
        logout: (state) => {
            state.token = null;
            state.user = null;
            state.isAuthenticated = false;
            localStorage.removeItem("access_token");
            localStorage.removeItem("user");
        },
    },
});

// Export Actions
export const { loginSuccess, logout } = authSlice.actions;

// Export Reducer
export default authSlice.reducer;
