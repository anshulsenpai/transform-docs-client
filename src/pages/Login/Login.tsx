import React, { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Input from "../../components/Input";
import { useDispatch } from "react-redux";
import { loginUser } from "../../services/authService";
import { unwrapResult } from "@reduxjs/toolkit";
import { AppDispatch } from "../../redux/store";
import { loginSuccess } from "../../redux/authSlice";


const Login: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const token = localStorage.getItem("access_token");
    // Validation Schema
    const validationSchema = Yup.object().shape({
        email: Yup.string()
            .email("Invalid email format")
            .required("Email is required"),
        password: Yup.string()
            .min(6, "Password must be at least 6 characters")
            .required("Password is required"),
    });

    // Submit Handler
    const handleSubmit = async (values: { email: string; password: string }) => {
        setLoading(true);
        try {
            const resultAction = await dispatch(loginUser(values));
            unwrapResult(resultAction);
            const { token, user } = resultAction.payload.data
            dispatch(loginSuccess({ token, user }))
            toast.success("Login Successful!");
            navigate('/dashboard');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error(error);
            setErrorMessage("Login failed. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            navigate("/dashboard");
        }
    }, [])

    return (
        <section className="flex justify-center items-center bg-indigo-900 h-screen">
            <div className="bg-white p-6 rounded-lg shadow-md w-96 mx-2">
                <header className="flex flex-col items-start justify-start mb-4">
                    <h1 className="text-gray-900 text-lg font-semibold mb-0 p-0">Welcome</h1>
                    <h5 className="text-xs text-gray-500">Please login with your email and password</h5>
                </header>
                {errorMessage && <div className="error-container text-xs w-full p-3 bg-red-50 text-red-600 rounded-lg mb-4">
                    {errorMessage}
                </div>}
                <Formik
                    initialValues={{ email: "", password: "" }}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ errors, touched }) => (
                        <Form>
                            <main>
                                {/* Email Input - Now it supports onChange */}
                                <div className="mb-4">
                                    <Field name="email">
                                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                        {({ field }: any) => (
                                            <Input
                                                {...field}
                                                type="email"
                                                placeholder="Enter your email"
                                                icon={<i className="fa-solid fa-at"></i>}
                                                className={`${errors.email && touched.email ? "border-red-500" : ""}`}
                                            />
                                        )}
                                    </Field>
                                    <ErrorMessage name="email" component="p" className="text-red-500 text-xs mt-1" />
                                </div>

                                {/* Password Input - Now it supports onChange */}
                                <div className="mb-4">
                                    <Field name="password">
                                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                        {({ field }: any) => (
                                            <Input
                                                {...field}
                                                type="password"
                                                placeholder="Enter your password"
                                                icon={<i className="fa-solid fa-lock"></i>}
                                                className={`${errors.password && touched.password ? "border-red-500" : ""}`}
                                            />
                                        )}
                                    </Field>
                                    <ErrorMessage name="password" component="p" className="text-red-500 text-xs mt-1" />
                                </div>

                                {/* Forgot Password Link */}
                                <a href="/sign-up" className="text-xs text-indigo-900 ms-1 font-semibold">
                                    Create new account
                                </a>
                            </main>

                            {/* Submit Button with Loading State */}
                            <footer className="mt-5">
                                <button
                                    type="submit"
                                    className="w-full py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all flex justify-center items-center"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <span className="animate-spin border-t-1 border-white rounded-full w-5 h-5"></span>
                                    ) : (
                                        "Login"
                                    )}
                                </button>
                            </footer>
                        </Form>
                    )}
                </Formik>
            </div>
        </section>
    );
};

export default Login;
