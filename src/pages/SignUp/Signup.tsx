/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/Input';
import { publicRequest } from '../../services/api';

function Signup() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Validation Schema
    const validationSchema = Yup.object().shape({
        name: Yup.string()
            .required('Full name is required')
            .min(2, 'Name must be at least 2 characters'),
        email: Yup.string()
            .email('Invalid email format')
            .required('Email is required'),
        gender: Yup.string()
            .required('Please select your gender'),
        password: Yup.string()
            .min(6, 'Password must be at least 6 characters')
            .required('Password is required'),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref('password')], 'Passwords must match')
            .required('Please confirm your password'),
    });

    // Submit Handler
    const handleSubmit = async (values: { 
        name: string; 
        email: string; 
        gender: string;
        password: string; 
        confirmPassword: string 
    }) => {
        setLoading(true);
        try {
            // Remove confirmPassword before sending to API
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { confirmPassword, ...userData } = values;
            const response = await publicRequest.post('/auth/register', userData);
            console.log(response);
            toast.success('Registration Successful! Please Log in');
            navigate('/');
        } catch (error: any) {
            console.error(error);
            setErrorMessage(error?.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='w-full h-screen flex justify-center items-center bg-indigo-900'>
            <div className='w-full max-w-96 bg-white p-6 rounded-lg shadow-md mx-2'>
                <header className='flex flex-col items-start justify-start mb-4'>
                    <h1 className='text-gray-900 text-lg font-semibold mb-0 p-0'>Sign up</h1>
                    <h5 className='text-xs text-gray-500'>Create your account to get started</h5>
                </header>

                {errorMessage && (
                    <div className='error-container text-xs w-full p-3 bg-red-50 text-red-600 rounded-lg mb-4'>
                        {errorMessage}
                    </div>
                )}

                <Formik
                    initialValues={{ 
                        name: '', 
                        email: '', 
                        gender: '',
                        password: '', 
                        confirmPassword: '' 
                    }}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ errors, touched }) => (
                        <Form>
                            <main>
                                {/* Name Input */}
                                <div className='mb-4'>
                                    <Field name='name'>
                                        {({ field }: any) => (
                                            <Input
                                                {...field}
                                                type='text'
                                                placeholder='Enter your full name'
                                                icon={<i className='fa-solid fa-user'></i>}
                                                className={`${errors.name && touched.name ? 'border-red-500' : ''}`}
                                                autoComplete='off'
                                            />
                                        )}
                                    </Field>
                                    <ErrorMessage name='name' component='p' className='text-red-500 text-xs mt-1' />
                                </div>

                                {/* Email Input */}
                                <div className='mb-4'>
                                    <Field name='email'>
                                        {({ field }: any) => (
                                            <Input
                                                {...field}
                                                type='email'
                                                placeholder='Enter your email'
                                                icon={<i className='fa-solid fa-at'></i>}
                                                className={`${errors.email && touched.email ? 'border-red-500' : ''}`}
                                                autoComplete='off'
                                            />
                                        )}
                                    </Field>
                                    <ErrorMessage name='email' component='p' className='text-red-500 text-xs mt-1' />
                                </div>

                                {/* Gender Selection */}
                                <div className='mb-4'>
                                    <div className='flex items-center w-full border rounded-lg overflow-hidden'>
                                        <div className='pl-3 pr-2 py-2 text-gray-400'>
                                            <i className='fa-solid fa-venus-mars'></i>
                                        </div>
                                        <Field
                                            as='select'
                                            name='gender'
                                            className={`w-full py-2 px-1 outline-none text-sm ${errors.gender && touched.gender ? 'border-red-500' : ''}`}
                                        >
                                            <option value='' disabled>Select your gender</option>
                                            <option value='male'>Male</option>
                                            <option value='female'>Female</option>
                                        </Field>
                                    </div>
                                    <ErrorMessage name='gender' component='p' className='text-red-500 text-xs mt-1' />
                                </div>

                                {/* Password Input */}
                                <div className='mb-4'>
                                    <Field name='password'>
                                        {({ field }: any) => (
                                            <Input
                                                {...field}
                                                type='password'
                                                placeholder='Create a password'
                                                icon={<i className='fa-solid fa-lock'></i>}
                                                className={`${errors.password && touched.password ? 'border-red-500' : ''}`}
                                            />
                                        )}
                                    </Field>
                                    <ErrorMessage name='password' component='p' className='text-red-500 text-xs mt-1' />
                                </div>

                                {/* Confirm Password Input */}
                                <div className='mb-4'>
                                    <Field name='confirmPassword'>
                                        {({ field }: any) => (
                                            <Input
                                                {...field}
                                                type='password'
                                                placeholder='Confirm your password'
                                                icon={<i className='fa-solid fa-check-double'></i>}
                                                className={`${errors.confirmPassword && touched.confirmPassword ? 'border-red-500' : ''}`}
                                            />
                                        )}
                                    </Field>
                                    <ErrorMessage name='confirmPassword' component='p' className='text-red-500 text-xs mt-1' />
                                </div>

                                {/* Login Link */}
                                <a href='/' className='text-xs text-indigo-900 ms-1 font-semibold'>
                                    Already have an account? Login
                                </a>
                            </main>

                            {/* Submit Button with Loading State */}
                            <footer className='mt-5'>
                                <button
                                    type='submit'
                                    className='w-full py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all flex justify-center items-center'
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <span className='animate-spin border-t-1 border-white rounded-full w-5 h-5'></span>
                                    ) : (
                                        'Sign Up'
                                    )}
                                </button>
                            </footer>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
}

export default Signup;