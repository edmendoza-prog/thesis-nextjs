'use client';

import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

export default function CoursesPage() {
  const courses = [
    {
      id: 1,
      title: "Math Adventures",
      grade: "Grade 1",
      description: "Learn counting, addition, and subtraction through fun games and activities!",
      icon: "🔢",
      color: "from-blue-400 to-blue-600",
      lessons: 24,
      students: 45
    },
    {
      id: 2,
      title: "Reading Rangers",
      grade: "Grade 1",
      description: "Master phonics and reading comprehension with exciting stories and characters!",
      icon: "📚",
      color: "from-green-400 to-green-600",
      lessons: 30,
      students: 42
    },
    {
      id: 3,
      title: "Science Explorers",
      grade: "Grade 2",
      description: "Discover the wonders of nature, animals, and the world around us!",
      icon: "🔬",
      color: "from-purple-400 to-purple-600",
      lessons: 20,
      students: 38
    },
    {
      id: 4,
      title: "Writing Wizards",
      grade: "Grade 2",
      description: "Develop writing skills through creative storytelling and guided exercises!",
      icon: "✏️",
      color: "from-yellow-400 to-yellow-600",
      lessons: 28,
      students: 40
    },
    {
      id: 5,
      title: "Social Studies Stars",
      grade: "Grade 3",
      description: "Learn about communities, cultures, and our place in the world!",
      icon: "🌍",
      color: "from-red-400 to-red-600",
      lessons: 22,
      students: 35
    },
    {
      id: 6,
      title: "Art & Creativity",
      grade: "Grade 3",
      description: "Express yourself through art, music, and creative projects!",
      icon: "🎨",
      color: "from-pink-400 to-pink-600",
      lessons: 18,
      students: 50
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-4">Explore Our Courses</h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto">
            Engaging, gamified learning experiences designed for Grade 1-3 students
          </p>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className={`bg-gradient-to-br ${course.color} h-48 flex items-center justify-center`}>
                  <span className="text-8xl">{course.icon}</span>
                </div>
                <div className="p-6">
                  <div className="inline-block bg-blue-100 text-blue-600 text-sm font-semibold px-3 py-1 rounded-full mb-3">
                    {course.grade}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{course.title}</h3>
                  <p className="text-gray-600 mb-4">{course.description}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span className="flex items-center">
                      <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      {course.lessons} Lessons
                    </span>
                    <span className="flex items-center">
                      <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      {course.students} Students
                    </span>
                  </div>

                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-full transition-colors">
                    Start Learning
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
