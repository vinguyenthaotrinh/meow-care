// src/pages/login.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AuthForm from '../components/auth/AuthForm';
import { fetchApi, resetSessionExpiredAlertFlag } from '../lib/api'; // Import reset function
import { toast } from 'react-toastify'; // Import toast
import LoadingSpinner from '../components/common/LoadingSpinner'; // Import a loading spinner

const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false); // For login API call
  const [isCheckingToken, setIsCheckingToken] = useState(true); // For initial token check
  const router = useRouter();

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // If token exists, redirect to dashboard immediately
      console.log("Existing token found, redirecting to dashboard.");
      router.replace('/dashboard'); // Use replace to avoid login page in history
    } else {
      // No token, allow rendering the login form
      setIsCheckingToken(false);
    }
    // Run only once on component mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array

  const handleLogin = async (formData: any) => {
    // Basic client-side validation
    if (!formData.email || !formData.password) {
        toast.error("Please enter both email and password.");
        return;
    }

    setIsLoading(true);

    try {
        // Use the correct endpoint '/login' based on your Flask routes
        const response = await fetchApi<{ token: string }>('/login', {
          method: 'POST',
          body: formData,
          // isProtected is false for the login route itself
        });

        if (response.error) {
          console.error("Login API Error:", response.error);
          toast.error(response.error || 'Login failed. Please check credentials.');
        } else if (response.data?.token) {
          // Login successful!
          console.log('Login successful');
          localStorage.setItem('authToken', response.data.token);

          // *** Reset the session expired flag ***
          resetSessionExpiredAlertFlag();

          toast.success('Login successful! Redirecting...');
          // Redirect to the main dashboard page
          router.push('/dashboard'); // Correct redirect target
        } else {
          // Unexpected case: no error, no token
          console.error("Login unexpected response:", response);
           toast.error('Login failed: Unexpected response from the server.');
        }
    } catch (err) {
         // Catch errors from fetchApi itself (e.g., network errors)
         console.error("Login submission error:", err);
         // err might already be an object from fetchApi with an error message
         const errorMessage = (err as any)?.error || "An error occurred during login. Please try again.";
         toast.error(errorMessage);
    } finally {
        setIsLoading(false);
    }
  };

  // Show loading indicator while checking for token
  if (isCheckingToken) {
    return (
      <main style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <LoadingSpinner />
      </main>
    );
  }

  // Render login form once token check is complete and no token was found
  return (
    <main> {/* Ensure main has appropriate styles from globals.css */}
      <AuthForm
        formType="login"
        onSubmit={handleLogin}
        isLoading={isLoading}
        error={null} // Errors are handled by toast notifications
      />
    </main>
  );
};

export default LoginPage;