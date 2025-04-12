// src/lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL; // Make sure this is set in .env.local

interface ApiCallOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD';
  headers?: Record<string, string>;
  body?: any;
  isProtected?: boolean;
}

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

const getToken = (): string | null => {
  // Ensure this runs only on the client side
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};

// --- Flag to prevent multiple session expired alerts ---
let isSessionExpiredAlertShown = false;

// --- Function to reset the flag (Exported) ---
export const resetSessionExpiredAlertFlag = () => {
  console.log("Resetting session expired alert flag."); // For debugging
  isSessionExpiredAlertShown = false;
};
// ---

export async function fetchApi<T>(
  endpoint: string,
  options: ApiCallOptions = {}
): Promise<ApiResponse<T>> {
  const { method = 'GET', headers = {}, body, isProtected = false } = options;

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add Authorization header if the route is protected
  if (isProtected) {
    const token = getToken();
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    } else {
      // Handle missing token for protected route on the client side
      if (typeof window !== 'undefined' && !isSessionExpiredAlertShown) {
          console.warn(`Auth token not found for protected route: ${endpoint}. Redirecting to login.`);
          isSessionExpiredAlertShown = true;
          alert('Your session has expired or you are not logged in. Please log in again.');
          localStorage.removeItem('authToken'); // Ensure clean state
          window.location.href = '/login'; // Force redirect
          return { error: 'Authentication required. Redirecting to login.', status: 401 };
      } else if (typeof window === 'undefined') {
          // Handle server-side scenario if needed
          console.warn(`Auth token not found for protected route on server: ${endpoint}`);
           return { error: 'Authentication required.', status: 401 };
      }
       // If alert already shown, just return error
      return { error: 'Authentication required.', status: 401 };
    }
  }

  const config: RequestInit = {
    method,
    headers: { ...defaultHeaders, ...headers },
  };

  if (body && method !== 'GET' && method !== 'HEAD') { // HEAD requests can't have body either
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);

    // Attempt to parse JSON, handle non-JSON responses gracefully
    let responseData: any;
    try {
        // Check if response has content before trying to parse JSON
        const contentType = response.headers.get("content-type");
        if (response.status !== 204 && contentType && contentType.includes("application/json")) {
            responseData = await response.json();
        } else if (response.status === 204) {
            responseData = null; // No content
        } else {
             // Handle non-JSON response, maybe read as text if needed for debugging
             // const textResponse = await response.text();
             // console.error("Non-JSON Response Text:", textResponse);
             responseData = { error: `Server returned status ${response.status} with non-JSON response.` };
        }
    } catch (jsonError) {
        console.error(`API response for ${endpoint} is not valid JSON. Status: ${response.status}`, jsonError);
        // Critical: Treat 401 as session expired even if JSON parsing fails
        if (response.status === 401) {
             if (typeof window !== 'undefined' && !isSessionExpiredAlertShown) {
                isSessionExpiredAlertShown = true;
                alert('Your session has expired. Please log in again.');
                localStorage.removeItem('authToken');
                window.location.href = '/login';
                return { error: 'Session expired. Please log in again.', status: 401 };
            }
             return { error: 'Session expired.', status: 401 }; // Already shown or server-side
        }
        // Return a generic error for other JSON parsing failures
        return { error: `Failed to parse server response (Status: ${response.status}).`, status: response.status };
    }


    if (!response.ok) {
      // Prefer error message from JSON if available
      const errorMessage = responseData?.error || responseData?.message || `HTTP error! status: ${response.status}`;
      console.error(`API Error (${response.status}) on ${endpoint}:`, errorMessage, responseData);

      // --- Specific 401 Handling with Alert ---
      if (response.status === 401) {
         if (typeof window !== 'undefined' && !isSessionExpiredAlertShown) {
            isSessionExpiredAlertShown = true;
            localStorage.removeItem('authToken');
            alert('Your session has expired. Please log in again.');
            window.location.href = '/login';
            // Return error even though redirecting
            return { error: 'Session expired. Please log in again.', status: 401 };
         } else if (isSessionExpiredAlertShown) {
             // Alert already shown, prevent loop
             return { error: 'Session expired. Redirecting...', status: 401 };
         }
         // Server-side 401
         return { error: 'Unauthorized.', status: 401 };
      }
      // --- End 401 Handling ---

      // Handle Pydantic validation errors (common status 422)
       if (response.status === 422 && responseData?.detail) {
           try {
              // Try to format Pydantic errors nicely
               const validationErrors = responseData.detail.map((err: any) => {
                   const field = err.loc?.slice(1).join('.') || 'input'; // Get field name (skip 'body')
                   return `${field}: ${err.msg}`;
               }).join('; ');
               return { error: `Invalid input data: ${validationErrors}`, status: 422 };
           } catch (formatError) {
                // Fallback if detail structure is unexpected
                return { error: responseData.error || 'Invalid input data.', status: 422 };
           }
       }

      // Return generic error from response or status
      return { error: errorMessage, status: response.status };
    }

    // Request was successful (2xx status code)
    return { data: responseData as T, status: response.status };

  } catch (error: unknown) {
    // Network errors or other exceptions during fetch
    console.error(`Network or other error calling ${endpoint}:`, error);
    let errorMessage = 'An unexpected network error occurred.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    // Do not trigger session expired alert for network errors
    return { error: 'Failed to connect to the server.', status: 503 }; // 503 Service Unavailable is often appropriate
  }
}