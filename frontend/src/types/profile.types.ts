// src/types/profile.types.ts

export interface ProfileBase {
    username?: string; // Optional vì PUT có thể chỉ cập nhật vài trường
    gender?: 'male' | 'female';
    weight?: number;
    height?: number;
    age?: number;
  }
  
  // Dùng cho GET request và hiển thị
  export interface ProfileResponse extends ProfileBase {
    user_id: string; // UUID
    // Các trường tính toán (read-only)
    daily_calories: number | null; // Có thể null nếu gender không hợp lệ ban đầu
    daily_water: number | null;    // Có thể null nếu weight không hợp lệ ban đầu
  }
  
  // Dùng cho form change password
  export interface ChangePasswordData {
      old_password: string;
      new_password: string;
  }