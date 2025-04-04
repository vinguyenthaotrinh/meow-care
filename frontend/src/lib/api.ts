// src/lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface ApiCallOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  isProtected?: boolean; // (Mới) Thêm cờ để biết có cần token không
}

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

// Hàm lấy token từ localStorage (có thể đặt ở file utils riêng sau này)
const getToken = (): string | null => {
  // Check if running on the client side before accessing localStorage
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};

export async function fetchApi<T>(
  endpoint: string,
  options: ApiCallOptions = {}
): Promise<ApiResponse<T>> {
  const { method = 'GET', headers = {}, body, isProtected = false } = options; // Mặc định là không cần token

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // (Mới) Thêm token vào header nếu là route cần bảo vệ và có token
  if (isProtected) {
    const token = getToken();
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    } else {
      // Nếu cần token mà không có -> Lỗi hoặc xử lý chuyển hướng ở đây nếu muốn
      console.warn(`Auth token not found for protected route: ${endpoint}`);
      // Có thể return một lỗi cụ thể để component xử lý chuyển hướng
      // return { error: 'Authentication required.', status: 401 };
    }
  }

  const config: RequestInit = {
    method,
    headers: {
      ...defaultHeaders,
      ...headers,
    },
  };

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const responseData = await response.json();

    if (!response.ok) {
      const errorMessage = responseData?.error || `HTTP error! status: ${response.status}`;
      console.error(`API Error (${response.status}) on ${endpoint}:`, errorMessage);

      // (Mới) Xử lý trường hợp token hết hạn hoặc không hợp lệ từ backend
      if (response.status === 401) {
         // Xóa token cũ và yêu cầu đăng nhập lại
         if (typeof window !== 'undefined') {
            localStorage.removeItem('authToken');
            // Có thể điều hướng về trang login ở đây hoặc để component gọi hàm quyết định
            // window.location.href = '/login';
            return { error: 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.', status: 401 };
         }
      }
       if (response.status === 422 && responseData.detail) {
           // Handle Pydantic validation errors if Flask-Pydantic returns them this way
           // This might need adjustment based on how your backend formats 422 errors
           const validationErrors = responseData.detail.map((err: any) => `${err.loc.join('.')} - ${err.msg}`).join('; ');
           return { error: `Lỗi dữ liệu đầu vào: ${validationErrors}`, status: 422 };
       }


      return { error: errorMessage, status: response.status };
    }

    return { data: responseData as T, status: response.status };

  } catch (error: unknown) {
    console.error(`Network or other error calling ${endpoint}:`, error);
    let errorMessage = 'An unexpected network error occurred.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return { error: 'Không thể kết nối đến máy chủ.', status: 503 };
  }
}