'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validate = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ email: data.error || 'Login failed. Please try again.' });
        return;
      }

      // Save session to localStorage
      localStorage.setItem('session', JSON.stringify(data));

      // Redirect to courses
      router.push('/courses');
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ email: 'An error occurred. Please try again.' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-lapis-900 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-3xl font-bold text-indigo-dye">
            Welcome back
          </h2>
          <p className="mt-2 text-center text-sm text-lapis-500">
            Log in to continue learning
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-indigo-dye">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-lapis-400 rounded-md shadow-sm focus:outline-none focus:ring-orange focus:border-orange bg-white"
              />
              {errors.email && <p className="mt-1 text-sm text-orange-600">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-indigo-dye">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-lapis-400 rounded-md shadow-sm focus:outline-none focus:ring-orange focus:border-orange bg-white"
              />
              {errors.password && <p className="mt-1 text-sm text-orange-600">{errors.password}</p>}
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange"
            >
              Log in
            </button>
          </div>

          <div className="text-center">
            <a href="/signup" className="text-sm text-indigo-dye hover:text-lapis">
              Don&apos;t have an account? Sign up
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
