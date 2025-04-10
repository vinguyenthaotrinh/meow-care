// src/components/common/LoadingSpinner.tsx
import styles from '../../styles/Home.module.css';

// Định nghĩa kiểu cho props
interface LoadingSpinnerProps {
  inline?: boolean; // Prop 'inline' là tùy chọn (optional) và kiểu boolean
}

// Sử dụng React.FC với kiểu props đã định nghĩa
// Destructure props và đặt giá trị mặc định cho inline là false
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ inline = false }) => {

  // Tạo chuỗi class động
  // Luôn có class 'spinner'
  // Thêm class 'inline' nếu prop inline là true
  const spinnerClasses = `${styles.spinner} ${inline ? styles.inline : ''}`.trim(); // trim() để xóa khoảng trắng thừa nếu inline là false

  return <div className={spinnerClasses}></div>;
};

export default LoadingSpinner;