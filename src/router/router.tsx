import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
// import { useSelector } from "react-redux";
// import { RootState } from "../redux/store";
import Login from "../pages/Login";
import Layout from "../layout/Layout";
import Dashboard from "../pages/Dashboard/Dashboard";
import Logout from "../pages/Logout/Logout";
import Document from "../pages/Document";
import Profile from "../pages/Profile/Profile";
import Signup from "../pages/SignUp";

// Protected Route Component
// const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
//     const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
//     return isAuthenticated ? children : <Navigate to="/login" replace />;
// };

// Create Browser Router Instance
const router = createBrowserRouter([
    {
        path: "/",
        element: <Login />, // Redirect root to dashboard
    },
    {
        path: "/dashboard",
        element: <Layout>
            <Dashboard />
        </Layout>,
    },
    {
        path: "/documents",
        element: <Layout>
            <Document />
        </Layout>,
    },
    {
        path: "/profile",
        element: <Layout>
            <Profile />
        </Layout>,
    },
    {
        path: "/sign-up",
        element: <Signup />,
    },
    {
        path: "*",
        element: <div className="flex justify-center items-center h-screen w-full bg-indigo-500">
            <h1 className="font-bold text-white">404 Page Not Found</h1>
        </div>,
    },
    {
        path: "/logout",
        element: <Logout />,
    }
]);

const AppRouter: React.FC = () => {
    return <RouterProvider router={router} />;
};

export default AppRouter;
