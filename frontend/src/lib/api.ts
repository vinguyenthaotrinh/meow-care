// src/lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface ApiCallOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'; // Mở rộng nếu cần
  headers?: Record<string, string>;
  body?: any; // Dữ liệu gửi đi (thường là object)
}

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

/**
 * Hàm gọi API chung
 * @param endpoint Đường dẫn API (ví dụ: '/login', '/register')
 * @param options Cấu hình cho fetch (method, headers, body)
 * @returns Promise chứa kết quả hoặc lỗi
 */
export async function fetchApi<T>(
  endpoint: string,
  options: ApiCallOptions = {}
): Promise<ApiResponse<T>> {
  const { method = 'GET', headers = {}, body } = options;

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    // Có thể thêm header Authorization nếu cần sau này
    // 'Authorization': `Bearer ${getToken()}`,
  };

  const config: RequestInit = {
    method,
    headers: {
      ...defaultHeaders,
      ...headers, // Ghi đè hoặc thêm header nếu được cung cấp
    },
  };

  // Chỉ thêm body nếu có và method không phải là GET
  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const responseData = await response.json();

    if (!response.ok) {
      // Nếu backend trả về lỗi có cấu trúc { "error": "..." }
      const errorMessage = responseData?.error || `HTTP error! status: ${response.status}`;
      console.error(`API Error (${response.status}) on ${endpoint}:`, responseData);
      return { error: errorMessage, status: response.status };
    }

    // Thành công
    return { data: responseData as T, status: response.status };

  } catch (error: unknown) {
    console.error(`Network or other error calling ${endpoint}:`, error);
    let errorMessage = 'An unexpected network error occurred.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    // Trả về lỗi chung chung hơn
    return { error: 'Failed to connect to the server.', status: 503 }; // 503 Service Unavailable
  }
}