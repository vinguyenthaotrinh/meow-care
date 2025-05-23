// src/types/habit.types.ts
import { Time } from "@internationalized/date"; // Cần cài đặt: npm install @internationalized/date

// --- Sleep ---
export interface SleepHabit {
  sleep_time: string; // Format "HH:MM:SS"
  wakeup_time: string; // Format "HH:MM:SS"
}

export interface SleepLog {
  id: string;
  user_id: string;
  task_type: 'sleep' | 'wakeup';
  scheduled_time: string; // ISO 8601 format string (e.g., "2023-10-27T22:00:00")
  completed: boolean;
}

// --- Hydrate ---
export interface HydrateHabit {
  water_goal: number; // ml
  cup_size: number; // ml
  reminder_time?: string[]; // List of "HH:MM:SS"
}

export interface HydrateLog {
  id: string;
  user_id: string;
  water_goal: number; // <--- Đảm bảo đã có ở đây
  consumed_water: number; // ml
  cup_size: number; // ml
  date: string; // Format "YYYY-MM-DD"
  completed: boolean;
}

// --- Diet ---
export interface DietDish { // Đảm bảo type này tồn tại
  name: string;
  calories: number;
}

export interface DietHabit {
  calories_goal: number;
  reminder_time?: string[]; // List of "HH:MM:SS"
}

export interface DietLog {
  id: string;
  user_id: string;
  calories_goal: number;
  dishes: DietDish[]; // *** QUAN TRỌNG: Đảm bảo là DietDish[] ***
  consumed_calories: number;
  date: string; // Format "YYYY-MM-DD"
  completed: boolean;
}
export interface DietLog {
  id: string;
  user_id: string;
  calories_goal: number;
  dishes: DietDish[]; // <-- Cập nhật thành mảng DietDish[]
  consumed_calories: number;
  date: string;
  completed: boolean;
}

// --- Focus ---
export interface FocusHabit {
  user_id: string;
  focus_goal: number; // in minutes
}

export interface FocusLog {
  id: string;
  user_id: string;
  focus_done: number; // in minutes
  date: string; // ISO Date string "YYYY-MM-DD"
  completed: boolean;
}

// --- Combined Todo Item ---
// Tạo một kiểu chung để dễ dàng hiển thị trong danh sách Todo
export type TodoItem =
  | ({ type: 'sleep' } & SleepLog)
  | ({ type: 'hydrate' } & HydrateLog)
  | ({ type: 'diet' } & DietLog)
  | ({ type: 'focus' } & FocusLog);