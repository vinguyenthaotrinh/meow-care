// src/pages/_app.tsx
import '../styles/globals.css'; // Đảm bảo bạn import global CSS ở đây
import type { AppProps } from 'next/app'; // Import kiểu dữ liệu cần thiết

// Định nghĩa component App tùy chỉnh
function MyApp({ Component, pageProps }: AppProps) {
  // Component: là component của trang hiện tại (ví dụ: LoginPage, RegisterPage)
  // pageProps: là các props ban đầu được truyền cho trang đó

  // Render component của trang hiện tại với các props của nó
  return <Component {...pageProps} />;

  /*
  // Sau này nếu bạn có Layout chung, bạn sẽ bọc nó ở đây:
  return (
      <Layout> // Ví dụ component Layout
          <Component {...pageProps} />
      </Layout>
  );
  */
}

// Quan trọng: Export component này làm default export
export default MyApp;