// src/pages/_app.tsx
import '../styles/globals.css';
import type { AppProps } from 'next/app';

// --- React Toastify Imports ---
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// Optional: Customize Toastify CSS or import a specific theme

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <> {/* Use Fragment to wrap multiple elements */}
      <Component {...pageProps} />
      {/* Configure options as needed */}
      <ToastContainer
        position="top-right" // Vị trí hiển thị
        autoClose={4000} // Tự động đóng sau 4 giây
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light" // Hoặc "dark", "colored"
      />
    </>
  );
}

export default MyApp;