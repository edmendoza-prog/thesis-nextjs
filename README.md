# Sacred Heart LMS - Gamified Learning Management System

A vibrant, engaging **Gamified Learning Management Web System** designed to enhance student engagement and academic performance for Grade 1-3 students at Sacred Heart School of Butuan, Inc.

![Next.js](https://img.shields.io/badge/Next.js-16.3.0-black)
![React](https://img.shields.io/badge/React-19.2.8-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)

## 🎯 Project Overview

This Learning Management System (LMS) is specifically designed for young learners (Grade 1-3) to make education fun, interactive, and engaging through gamification techniques. The platform features a colorful, kid-friendly interface that motivates students to learn and achieve their academic goals.

## ✨ Key Features

### 1. **Vibrant Dashboard** 📊
- Colorful and engaging interface designed for young students
- Real-time progress tracking with visual indicators
- Achievement badges and rewards system
- Weekly goals and activity tracking
- Quick action buttons for common tasks

### 2. **Interactive Quizzes** 🎮
- Gamified quiz system with instant feedback
- Points and badge rewards for completion
- Multiple quiz types across different subjects
- Progress tracking and score history
- Fun animations and encouraging messages

### 3. **Progress Tracking** 📈
- Real-time monitoring of student progress
- Course completion percentages
- Visual progress bars for each subject
- Recent activity feed
- Performance analytics

### 4. **Teacher-Student Communication** 💬
- Seamless communication tools
- Assignment notifications
- Feedback system
- Parent-teacher communication portal
- Real-time updates and announcements

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ installed
- npm or yarn package manager
- XAMPP (for MySQL database)
- Modern web browser

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd thesis-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
# Configure .env file with your MySQL credentials
# See DATABASE_SETUP.md for detailed instructions

# Test database connection
npm run db:test

# Run migrations to create tables
npm run db:migrate
```

4. Run the development server:
```bash
npm run dev
```

5. Open your browser and navigate to:
```
http://localhost:3000
```

### Database Setup

This project uses MySQL (XAMPP) for data storage. Quick setup:

1. **Start XAMPP** - Start MySQL service
2. **Create Database** - Create `thesis_db` in phpMyAdmin
3. **Configure** - Update `.env` with your credentials
4. **Test Connection** - Run `npm run db:test`
5. **Run Migrations** - Run `npm run db:migrate`

📚 **Detailed guides:**
- [DATABASE_SETUP.md](./DATABASE_SETUP.md) - Complete setup instructions
- [DATABASE_COMMANDS.md](./DATABASE_COMMANDS.md) - Quick command reference
- [HOW_TO_MIGRATE.md](./HOW_TO_MIGRATE.md) - Migration guide

### Available NPM Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:test      # Test database connection
npm run db:migrate   # Run database migrations
```

## 📁 Project Structure

```
thesis-app/
├── app/
│   ├── components/
│   │   ├── Navigation.tsx      # Main navigation bar
│   │   ├── HeroSection.tsx     # Landing page hero section
│   │   ├── FeaturesSection.tsx # Features showcase
│   │   ├── SocialSidebar.tsx   # Social media links
│   │   └── Footer.tsx          # Footer component
│   ├── courses/
│   │   └── page.tsx            # Courses listing page
│   ├── dashboard/
│   │   └── page.tsx            # Student dashboard
│   ├── login/
│   │   └── page.tsx            # Login page
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Landing page
│   └── globals.css             # Global styles
├── public/                     # Static assets
├── package.json
└── README.md
```

## 🎨 Design Features

### Color Scheme
- **Primary Blue**: `#2563EB` - Used for main actions and navigation
- **Vibrant Yellow**: `#FBBF24` - Used for highlights and excitement
- **Purple Accent**: `#9333EA` - Used for special features
- **Success Green**: `#10B981` - Used for positive feedback

### Typography
- Clean, readable fonts optimized for young learners
- Large, friendly text sizes
- High contrast for easy reading

### Visual Elements
- Rounded corners and soft shadows
- Playful icons and emojis
- Smooth animations and transitions
- Gradient backgrounds
- Interactive hover effects

## 📄 Pages

### 1. **Landing Page** (`/`)
- Eye-catching hero section with promotional banners
- Feature badges (Activities, Education, Creativity)
- Key features overview
- Statistics showcase
- Social media integration

### 2. **Courses Page** (`/courses`)
- Grid of available courses for Grade 1-3
- Course cards with subjects:
  - Math Adventures 🔢
  - Reading Rangers 📚
  - Science Explorers 🔬
  - Writing Wizards ✏️
  - Social Studies Stars 🌍
  - Art & Creativity 🎨
- Lesson count and student enrollment info
- Grade-level filtering

### 3. **Dashboard** (`/dashboard`)
- Personalized student welcome
- Total points display
- Progress bars for each course
- Recent activities feed
- Achievement badges
- Weekly goal tracker
- Quick action buttons

### 4. **Login Page** (`/login`)
- Multi-role authentication (Student, Teacher, Parent)
- Clean, modern design
- Quick demo access for testing
- Password recovery option
- Remember me functionality

## 🛠️ Technologies Used

- **Next.js 16.3.0** - React framework with App Router
- **React 19.2.8** - UI library
- **TypeScript 5** - Type-safe development
- **Tailwind CSS 4** - Utility-first CSS framework
- **MySQL 8.0** - Relational database (via XAMPP)
- **mysql2** - MySQL client for Node.js
- **Turbopack** - Fast bundler for development

## 🎯 Target Audience

- **Primary Users**: Grade 1-3 students (ages 6-9)
- **Secondary Users**: Teachers and parents
- **Institution**: Sacred Heart School of Butuan, Inc.

## 🔮 Future Enhancements

- [ ] Real-time multiplayer quiz competitions
- [ ] Virtual classroom integration
- [ ] Augmented Reality (AR) learning experiences
- [ ] Parent mobile app
- [ ] Advanced analytics dashboard for teachers
- [ ] Gamification leaderboards
- [ ] Voice-enabled lessons for accessibility
- [ ] Integration with school management system
- [ ] Offline mode support
- [ ] Multi-language support

## 📱 Responsive Design

The platform is fully responsive and works seamlessly across:
- Desktop computers
- Tablets
- Mobile phones

## 🤝 Contributing

This is a thesis project for Sacred Heart School of Butuan, Inc. For questions or contributions, please contact the development team.

## 📞 Support

For support, email: info@sacredheart.edu.ph

## 📄 License

This project is developed for Sacred Heart School of Butuan, Inc.

---

**Built with ❤️ for young learners at Sacred Heart School of Butuan, Inc.**
