import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "../pages/Login";
import Layout from "../layout/Layout";
import Dashboard from "../pages/Dashboard/Dashboard";
import Logout from "../pages/Logout/Logout";
import Document from "../pages/Document";
import Profile from "../pages/Profile/Profile";
import Signup from "../pages/SignUp";
import ProtectedRoute from "./ProtectedRoute";
import AdminDashboard from "../pages/AdminDashboard/AdminDashboard";
import AdminDocuments from "../pages/AdminDocuments/AdminDocuments";
import SharedDocument from "../pages/SharedDocuments/SharedDocuments";
import AdminSharedDocuments from "../pages/AdminSharedDocuments/AdminSharedDocuments";

// Router instance
const router = createBrowserRouter([
    {
        path: "/",
        element: <Login />,
    },
    {
        path: "/sign-up",
        element: <Signup />,
    },
    {
        path: "/logout",
        element: <Logout />,
    },
    {
        path: "/dashboard",
        element: (
            <ProtectedRoute requiredRole="user">
                <Layout>
                    <Dashboard />
                </Layout>
            </ProtectedRoute>
        ),
    },
    {
        path: "/shared-docs",
        element: (
            <ProtectedRoute requiredRole="user">
                <Layout>
                    <SharedDocument />
                </Layout>
            </ProtectedRoute>
        ),
    },
    {
        path: "/documents",
        element: (
            <ProtectedRoute requiredRole="user">
                <Layout>
                    <Document />
                </Layout>
            </ProtectedRoute>
        ),
    },
    {
        path: "/profile",
        element: (
            <ProtectedRoute>
                <Layout>
                    <Profile />
                </Layout>
            </ProtectedRoute>
        ),
    },

    // Admin Routes
    {
        path: "/admin/dashboard",
        element: (
            <ProtectedRoute requiredRole="admin">
                <Layout>
                    <AdminDashboard />
                </Layout>
            </ProtectedRoute>
        ),
    },
    {
        path: "/admin/documents",
        element: (
            <ProtectedRoute requiredRole="admin">
                <Layout>
                    <AdminDocuments />
                </Layout>
            </ProtectedRoute>
        ),
    },
    {
        path: "/admin/shared-documents",
        element: (
            <ProtectedRoute requiredRole="admin">
                <Layout>
                    <AdminSharedDocuments />
                </Layout>
            </ProtectedRoute>
        ),
    },

    // Unauthorized Access Page
    {
        path: "/unauthorized",
        element: (
            <div className="flex justify-center items-center h-screen w-full bg-red-500">
                <h1 className="font-bold text-white">403 Unauthorized</h1>
            </div>
        ),
    },

    // 404 Not Found
    {
        path: "*",
        element: (
            <div className="flex justify-center items-center h-screen w-full bg-indigo-500">
                <h1 className="font-bold text-white">404 Page Not Found</h1>
            </div>
        ),
    },
]);

const AppRouter: React.FC = () => {
    return <RouterProvider router={router} />;
};

export default AppRouter;
