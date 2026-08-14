'use client';

import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

export default function DashboardPage() {
  const achievements = [
    { title: "Reading Star", icon: "⭐", color: "bg-yellow-400" },
    { title: "Math Master", icon: "🎯", color: "bg-blue-400" },
    { title: "Perfect Week", icon: "🏆", color: "bg-purple-400" },
    { title: "Quiz Champion", icon: "🥇", color: "bg-green-400" }
  ];

  const recentActivities = [
    { course: "Math Adventures", activity: "Completed Addition Quest", time: "2 hours ago", score: 95 },
    { course: "Reading Rangers", activity: "Finished Story Level 5", time: "1 day ago", score: 88 },
    { course: "Science Explorers", activity: "Animal Quiz Challenge", time: "2 days ago", score: 100 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navigation />
      
      {/* Dashboard Header */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Welcome back, Student! 👋</h1>
              <p className="text-xl opacity-90">Ready to continue your learning adventure?</p>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 text-center">
                <div className="text-4xl font-bold mb-1">850</div>
                <div className="text-sm opacity-90">Total Points</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Progress Overview */}
              <div className="bg-white rounded-3xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Progress</h2>
                
                <div className="space-y-4">
                  {[
                    { name: "Math Adventures", progress: 75, color: "bg-blue-500" },
                    { name: "Reading Rangers", progress: 60, color: "bg-green-500" },
                    { name: "Science Explorers", progress: 85, color: "bg-purple-500" }
                  ].map((course, index) => (
                    <div key={index}>
                      <div className="flex justify-between mb-2">
                        <span className="font-semibold text-gray-700">{course.name}</span>
                        <span className="text-gray-600">{course.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`${course.color} h-3 rounded-full transition-all duration-500`}
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activities */}
              <div className="bg-white rounded-3xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activities</h2>
                
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                      <div>
                        <div className="font-semibold text-gray-900">{activity.activity}</div>
                        <div className="text-sm text-gray-600">{activity.course}</div>
                        <div className="text-xs text-gray-500 mt-1">{activity.time}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{activity.score}</div>
                        <div className="text-xs text-gray-500">Score</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Achievements */}
              <div className="bg-white rounded-3xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Achievements</h2>
                <div className="grid grid-cols-2 gap-4">
                  {achievements.map((achievement, index) => (
                    <div
                      key={index}
                      className={`${achievement.color} rounded-2xl p-4 text-center transform hover:scale-105 transition-transform`}
                    >
                      <div className="text-4xl mb-2">{achievement.icon}</div>
                      <div className="text-xs font-semibold text-white">{achievement.title}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly Goal */}
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl shadow-lg p-6 text-white">
                <h2 className="text-xl font-bold mb-4">Weekly Goal</h2>
                <div className="text-center">
                  <div className="text-5xl font-bold mb-2">4/7</div>
                  <div className="text-sm opacity-90">Days Completed</div>
                  <div className="mt-4 bg-white/20 rounded-full h-2">
                    <div className="bg-white h-2 rounded-full" style={{ width: '57%' }}></div>
                  </div>
                  <p className="text-sm mt-3 opacity-90">Keep it up! You're doing great!</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-3xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-full transition-colors">
                    Take a Quiz
                  </button>
                  <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-full transition-colors">
                    Continue Learning
                  </button>
                  <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-full transition-colors">
                    View Rewards
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
