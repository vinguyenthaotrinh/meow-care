// src/pages/dashboard/index.tsx
import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { fetchApi } from '../../lib/api';
import { SleepHabit, SleepLog, HydrateLog, DietLog, TodoItem, UserStats, HydrateHabit, DietHabit } from '../../types/habit.types';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import styles from '../../styles/Dashboard.module.css';
import Image from 'next/image';
import catImageSrc from '../../assets/images/default-cat.png';
import HabitProgress from '../../components/dashboard/HabitProgress'; // Import HabitProgress
import TodoList from '../../components/dashboard/TodoList'; // Import TodoList
import DietUpdateModal from '@/components/dashboard/DietUpdateModal';

// --- Helper Functions ---
const formatTime = (timeString: string | null | undefined): string => {
    if (!timeString) return "N/A";
    try {
        // Nếu backend trả về "HH:MM:SS"
        if (/^\d{2}:\d{2}:\d{2}$/.test(timeString)) {
            const [hours, minutes] = timeString.split(':');
            // Tạo date giả để dùng toLocaleTimeString
            const date = new Date();
            date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0);
            return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        }
        // Nếu backend trả về ISO String
        const date = new Date(timeString);
        if (isNaN(date.getTime())) return "Invalid Time"; // Kiểm tra date hợp lệ
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } catch (e) {
        console.error("Error formatting time:", timeString, e);
        return "Error";
    }
};

const formatAmount = (amount: number | null | undefined, unit: string): string => {
    if (amount === null || amount === undefined) return `? ${unit}`;
    // Làm tròn đến 1 chữ số thập phân nếu là float, không làm tròn nếu là int
    const roundedAmount = Number.isInteger(amount) ? amount : amount.toFixed(1);
    return `${roundedAmount} ${unit}`;
}

const calculatePercentage = (consumed: number | undefined, goal: number | undefined): number => {
    if (goal === null || goal === undefined || consumed === null || consumed === undefined || goal <= 0) {
        return 0;
    }
    const percentage = (consumed / goal) * 100;
    return Math.min(Math.max(percentage, 0), 100); // Giữ trong khoảng 0-100
};


const DashboardHomePage = () => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [sleepHabit, setSleepHabit] = useState<SleepHabit | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => { /* ... (same fetchData as before) */
      setIsLoading(true);
      setError(null);
      setIsUpdating({}); // Reset loading item
      try {
          const [sleepLogsRes, hydrateLogsRes, dietLogsRes, sleepHabitRes /*, userStatsRes */] = await Promise.all([
              fetchApi<SleepLog[]>('/sleep/logs/today', { isProtected: true }),
              fetchApi<HydrateLog[]>('/hydrate/logs/today', { isProtected: true }),
              fetchApi<DietLog[]>('/diet/logs/today', { isProtected: true }),
              fetchApi<SleepHabit>('/sleep/habit', { isProtected: true }), // Lấy giờ ngủ/dậy mục tiêu
              // --- TODO: Add API call for User Stats ---
              Promise.resolve({ data: { xp: 100, level: 1, streak: 10 }, status: 200 }), // Fake data for now
          ]);

          let combinedTodos: TodoItem[] = [];
          let apiErrors: string[] = []; // Thu thập các lỗi

          // Process Sleep
          if (sleepLogsRes.data) {
              combinedTodos = combinedTodos.concat(sleepLogsRes.data.map(log => ({ ...log, type: 'sleep' })));
          } else if (sleepLogsRes.error && sleepLogsRes.status !== 404) {
              apiErrors.push(`Sleep Logs: ${sleepLogsRes.error}`);
          }
          if (sleepHabitRes.data) {
              setSleepHabit(sleepHabitRes.data);
          } else if (sleepHabitRes.error && sleepHabitRes.status !== 404) {
              apiErrors.push(`Sleep Habit: ${sleepHabitRes.error}`);
          }


          // Process Hydrate (Log đã có goal)
          if (hydrateLogsRes.data && hydrateLogsRes.data.length > 0) {
              // Assume only one hydrate log per day from API
              combinedTodos.push({ ...hydrateLogsRes.data[0], type: 'hydrate' });
          } else if (hydrateLogsRes.error && hydrateLogsRes.status !== 404) {
              apiErrors.push(`Hydrate Logs: ${hydrateLogsRes.error}`);
          }

          // Process Diet (Log đã có goal)
          if (dietLogsRes.data && dietLogsRes.data.length > 0) {
              // Assume only one diet log per day from API
              combinedTodos.push({ ...dietLogsRes.data[0], type: 'diet' });
          } else if (dietLogsRes.error && dietLogsRes.status !== 404) {
              apiErrors.push(`Diet Logs: ${dietLogsRes.error}`);
          }

          // Sort todos (e.g., by scheduled time for sleep, then others)
          combinedTodos.sort((a, b) => {
              const getTime = (item: TodoItem) => {
                  if (item.type === 'sleep' && item.scheduled_time) return new Date(item.scheduled_time).getTime();
                  return Infinity; // Đẩy các item không có giờ xuống cuối
              }
              const timeA = getTime(a);
              const timeB = getTime(b);
              if (timeA !== Infinity || timeB !== Infinity) return timeA - timeB;

              // Sắp xếp theo type nếu không có giờ
              const typeOrder = { 'sleep': 1, 'hydrate': 2, 'diet': 3 };
              return (typeOrder[a.type] || 99) - (typeOrder[b.type] || 99);
          });

          setTodos(combinedTodos);

          // Process User Stats (using fake data)
          const userStatsRes = { data: { xp: 100, level: 1, streak: 10 } };
          if (userStatsRes.data) {
              setUserStats(userStatsRes.data);
          } // else if(userStatsRes.error) { apiErrors.push(...) }

          if (apiErrors.length > 0) setError(`API Errors: ${apiErrors.join('; ')}`);

      } catch (err) {
          console.error("Failed to fetch dashboard data:", err);
          setError("Failed to load dashboard data. Please try again.");
      } finally {
          setIsLoading(false);
      }
  }, []);

  useEffect(() => {
      fetchData();
  }, [fetchData]);

  // --- Action Handlers (Keep) ---
  const setItemLoading = (id: string, loading: boolean) => { /* ... (same as before) */
      setIsUpdating(prev => ({ ...prev, [id]: loading }));
  };
  const updateTodoInState = (updatedItem: TodoItem) => { /* ... (same as before) */
      setTodos(prevTodos => prevTodos.map(todo =>
          todo.id === updatedItem.id ? updatedItem : todo
      ));
  };
  const handleCompleteSleep = async (logId: string) => { /* ... (same as before) */
      setItemLoading(logId, true);
      setError(null);
      const response = await fetchApi<SleepLog>(`/sleep/logs/${logId}/complete`, {
          method: 'PUT',
          isProtected: true,
      });
      setItemLoading(logId, false);

      if (response.data) {
          // API should return the updated log
          updateTodoInState({ ...response.data, type: 'sleep' }); // Add type back
      } else {
          setError(response.error || 'Failed to complete task.');
      }
  };
  const handleUpdateHydrate = async (logId: string) => { /* ... (same as before) */
      setItemLoading(logId, true);
      setError(null);
      const response = await fetchApi<HydrateLog>(`/hydrate/logs/${logId}/update`, {
          method: 'PUT',
          isProtected: true,
      });
      setItemLoading(logId, false);

      if (response.data) {
          // API returns the updated log with new consumed_water
          updateTodoInState({ ...response.data, type: 'hydrate' }); // Add type back
      } else {
          setError(response.error || 'Failed to update water intake.');
      }
  };
  
const handleUpdateDiet = async (logId: string) => { // Function now only opens the modal
    setDietModalOpen(logId);
};

const [dietModalOpen, setDietModalOpen] = useState<string | null>(null); // State for modal visibility

const handleCloseDietModal = () => {
    setDietModalOpen(null);
};

const handleFoodAddedToLog = useCallback((updatedLog: DietLog) => {
    updateTodoInState({ ...updatedLog, type: 'diet' }); // Update todo in state
}, [updateTodoInState]);

  return (
      <DashboardLayout>
          {isLoading && <div className={styles.fullPageSpinnerContainer}><LoadingSpinner /></div>}
          {!isLoading && (
              <div className={styles.homeGrid}>
                  {/* --- Left Column --- */}
                  <div className={styles.leftColumn}>
                      {/* User Stats (Keep) */}
                      <div className={styles.userStats}>
                          <h2 className={styles.sectionTitle}>Progress</h2>
                          {isLoading && !userStats ? <LoadingSpinner /> : userStats ? (
                              <>
                                  <p className={styles.statItem}>
                                      <span className={styles.statLabel}>XP:</span>
                                      <span className={styles.statValue}>{userStats.xp}</span>
                                  </p>
                                  <p className={styles.statItem}>
                                      <span className={styles.statLabel}>Level:</span>
                                      <span className={styles.statValue}>{userStats.level}</span>
                                  </p>
                                  <p className={styles.statItem}>
                                      <span className={styles.statLabel}>Streak 🔥:</span>
                                      <span className={styles.statValue}>{userStats.streak} days</span>
                                  </p>
                              </>
                          ) : <p>Could not load user stats.</p>}
                      </div>

                      {/* Habit Icons/Progress - Use HabitProgress Component */}
                      <div className={styles.habitIconsContainer}>
                          <HabitProgress todos={todos} sleepHabit={sleepHabit} isLoading={isLoading} />
                      </div>

                      {/* Cat Image (Keep) */}
                      <div className={styles.catContainer}>
                          <Image
                              src={catImageSrc}
                              alt="User's companion cat"
                              width={150}
                              height={150}
                              priority
                              style={{ objectFit: 'contain' }}
                          />
                      </div>
                  </div>

                  {/* --- Right Column --- */}
                  <div className={styles.rightColumn}>
                      <h2 className={styles.sectionTitle}>Today's Tasks</h2>
                      {/* Todo List - Use TodoList Component */}
                      <TodoList
                          todos={todos}
                          isUpdating={isUpdating}
                          setItemLoading={setItemLoading}
                          setError={setError}
                          handleCompleteSleep={handleCompleteSleep}
                          handleUpdateHydrate={handleUpdateHydrate}
                          handleUpdateDiet={handleUpdateDiet} // Pass handleUpdateDiet (now opens modal)
                          formatTime={formatTime}
                          formatAmount={formatAmount}
                          updateTodoInState={updateTodoInState} // Pass updateTodoInState callback
                      />
                      {error && <p style={{ color: 'red', marginTop: '1rem', fontSize: '0.9rem' }}>API Error: {error}</p>}
                  </div>
              </div>
          )}
          {dietModalOpen && ( // Render modal when dietModalOpen is not null
              <DietUpdateModal
                  logId={dietModalOpen}
                  isOpen={!!dietModalOpen} // Convert string or null to boolean
                  onClose={handleCloseDietModal}
                  onFoodAdded={handleFoodAddedToLog} // Pass callback to handle food added
              />
          )}
      </DashboardLayout>
  );
};

export default DashboardHomePage;