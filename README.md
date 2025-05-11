# 🐾 Meow-care

Meow-care is a self-care gamification platform that helps users build healthy habits through engaging quests, progress tracking, and XP-based rewards. Users log their daily activities like hydration, meals, sleep, focus time, and check-ins, and get rewarded for consistency and discipline.

## 🚀 Features

* 👤 User authentication
* 🎯 Daily quests and streak tracking
* 🧘 Sleep, Hydration, Diet, Focus habit logging
* 🛠️ Personal info & habit setting
* 🏆 XP and reward system

## 💪 Tech Stack

### Backend

* **Flask** — Python web framework
* **Supabase** — PostgreSQL Database
* **Supabase Python SDK** — used instead of SQLAlchemy
* **Cron Jobs** — for daily/monthly resets and background tasks
* **Redis** — caching & leaderboard

### Frontend

* **React** — dynamic user interaction
* **Tailwind CSS** — utility-first styling

### DevOps / Deployment

* **Docker Compose** — local development and multi-container setup
* **GitHub Actions** — CI/CD pipeline
* **Nginx** — reverse proxy for backend/frontend
* **AWS EC2** — deployment server

## 🐳 Local Setup with Docker

1. Install Docker and Docker Compose.
2. Set up your own Supabase project (see `./backend/database`) and get the required environment variables.
3. Rename `.env.example` to `.env` and fill in the values.

    ```text
    SUPABASE_URL=https://your-supabase-url.supabase.co
    SUPABASE_KEY=your-supabase-key
    JWT_SECRET_KEY=your-jwt-secret-key
    ```

4. Run:

    ```bash
    docker compose up -d
    ```

## ✅ Roadmap

* [x] User authentication
* [x] Daily quests and streak tracking
* [x] Sleep, Hydration, Diet, Focus habit logging
* [x] Personal info & habit setting
* [x] XP and reward system
* [x] CI/CD & deployment
* [ ] Notifications system (daily reminders, goal alerts)
* [ ] Admin dashboard (quest management, user insights)
* [ ] Social sharing or community features (friend system, leaderboard sharing)
* [ ] In-app analytics or user progress reports

## 🐱 Credits

Created with care by Vi Nguyen-Thao Trinh \:D

## 📄 License

This project is licensed under the MIT License.
