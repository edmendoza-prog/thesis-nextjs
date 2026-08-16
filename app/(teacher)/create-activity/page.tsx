'use client';

import { useEffect, useState } from 'react';

const gameTypes = [
  { id: 'quiz', label: 'Quiz Adventure', icon: '📝' },
  { id: 'matching', label: 'Matching Game', icon: '🎴' },
  { id: 'speed', label: 'Speed Challenge', icon: '⚡' },
  { id: 'puzzle', label: 'Puzzle Game', icon: '🧩' },
  { id: 'race', label: 'Race Game', icon: '🏁' },
  { id: 'spin', label: 'Spin the Wheel', icon: '🎡' },
];

function Icon({ type, className = "h-5 w-5" }: { type: string; className?: string }) {
  switch (type) {
    case 'circle-plus':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><path d="M12 8v8M8 12h8" /></svg>;
    case 'save':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><path d="M17 21v-8H7v8" /><path d="M7 3v5h8" /></svg>;
    default:
      return null;
  }
}

export default function CreateActivityPage() {
  const [activityType, setActivityType] = useState<'live' | 'self'>('live');
  const [selectedGame, setSelectedGame] = useState('quiz');
  const [visibility, setVisibility] = useState('section');
  const [includeQuiz, setIncludeQuiz] = useState(false);
  const [classes, setClasses] = useState<{ id: number; name: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [classId, setClassId] = useState('');
  const [subject, setSubject] = useState('Math');
  const [points, setPoints] = useState('50');
  const [badge, setBadge] = useState('');

  useEffect(() => {
    async function loadClasses() {
      try {
        const response = await fetch('/api/teacher/create-activity');
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to load classes');
        setClasses(data.classes ?? []);
        if (data.classes?.[0]) setClassId(String(data.classes[0].id));
      } catch (error) {
        console.error('Class fetch error:', error);
      }
    }

    loadClasses();
  }, []);

  const handleSaveActivity = async () => {
    if (!title.trim() || !classId) {
      alert('Please add an activity title and choose a class');
      return;
    }

    try {
      setSaving(true);
      const response = await fetch('/api/teacher/create-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          class_id: Number(classId),
          subject,
          activity_type: selectedGame,
          visibility,
          include_quiz: includeQuiz,
          points: Number(points || 0),
          badge: badge.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create activity');
      alert('Activity saved successfully');
      setTitle('');
      setBadge('');
      setPoints('50');
    } catch (error) {
      console.error('Create activity error:', error);
      alert(error instanceof Error ? error.message : 'Unable to save activity');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <header className="mb-6 animate-fadeInUp">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-secondary-400 flex items-center justify-center">
            <Icon type="circle-plus" className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-4xl font-heading font-bold text-foreground-900">Create Activity</h1>
        </div>
      </header>

      <div className="space-y-6">
        {/* Basic Information */}
        <section className="bg-background-50 rounded-2xl border border-background-200/70 p-6 animate-fadeInUp" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center text-xl">📋</div>
            <h2 className="text-xl font-heading font-bold text-foreground-900">Basic Information</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-foreground-700 mb-2 font-body">Activity Title</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter activity title"
                className="w-full px-4 py-3 rounded-xl border border-background-300 bg-background-50 focus:outline-none focus:ring-2 focus:ring-primary-300 font-body"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-foreground-700 mb-2 font-body">Select Class</label>
                <select
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-background-300 bg-background-50 focus:outline-none focus:ring-2 focus:ring-primary-300 font-body"
                >
                  <option value="">Choose a class</option>
                  {classes.map((classItem) => (
                    <option key={classItem.id} value={classItem.id}>{classItem.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground-700 mb-2 font-body">Select Subject</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-background-300 bg-background-50 focus:outline-none focus:ring-2 focus:ring-primary-300 font-body"
                >
                  <option>Choose a subject</option>
                  <option>Math</option>
                  <option>Science</option>
                  <option>English</option>
                  <option>Reading</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Activity Type */}
        <section className="bg-background-50 rounded-2xl border border-background-200/70 p-6 animate-fadeInUp" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center text-xl">✨</div>
            <h2 className="text-xl font-heading font-bold text-foreground-900">Activity Type</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setActivityType('live')}
              className={`p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-[1.02] ${
                activityType === 'live' 
                  ? 'border-primary-400 bg-primary-50' 
                  : 'border-background-200 bg-background-50 hover:border-background-300'
              }`}
            >
              <div className="text-4xl mb-3">🎭</div>
              <h3 className="font-heading font-bold text-lg text-foreground-900 mb-2">Live Class Activity</h3>
              <p className="text-sm text-foreground-600 font-body">Teacher-controlled activity for classroom presentation (Spin Wheel, Racing Games)</p>
            </button>
            <button
              onClick={() => setActivityType('self')}
              className={`p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-[1.02] ${
                activityType === 'self' 
                  ? 'border-accent-400 bg-accent-50' 
                  : 'border-background-200 bg-background-50 hover:border-background-300'
              }`}
            >
              <div className="text-4xl mb-3">🎮</div>
              <h3 className="font-heading font-bold text-lg text-foreground-900 mb-2">Student Self-Paced</h3>
              <p className="text-sm text-foreground-600 font-body">Students complete independently at their own pace (Quizzes, Games, Puzzles)</p>
            </button>
          </div>
        </section>

        {/* Select Game Type */}
        <section className="bg-background-50 rounded-2xl border border-background-200/70 p-6 animate-fadeInUp" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center text-xl">🎯</div>
            <h2 className="text-xl font-heading font-bold text-foreground-900">Select Game Type</h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {gameTypes.map((game) => (
              <button
                key={game.id}
                onClick={() => setSelectedGame(game.id)}
                className={`p-4 rounded-xl border-2 transition-all duration-300 hover:scale-[1.02] ${
                  selectedGame === game.id
                    ? 'border-primary-400 bg-primary-50 ring-2 ring-primary-200'
                    : 'border-background-200 bg-background-50 hover:border-background-300'
                }`}
              >
                <div className="text-3xl mb-2">{game.icon}</div>
                <div className="font-body font-semibold text-sm text-foreground-900">{game.label}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Activity Visibility */}
        <section className="bg-background-50 rounded-2xl border border-background-200/70 p-6 animate-fadeInUp" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center text-xl">👁️</div>
            <h2 className="text-xl font-heading font-bold text-foreground-900">Activity Visibility</h2>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => setVisibility('section')}
              className={`p-5 rounded-xl border-2 transition-all duration-300 hover:scale-[1.02] ${
                visibility === 'section'
                  ? 'border-accent-400 bg-accent-50'
                  : 'border-background-200 bg-background-50 hover:border-background-300'
              }`}
            >
              <h3 className="font-heading font-bold text-foreground-900 mb-1">Only This Section</h3>
              <p className="text-xs text-foreground-600 font-body">Visible to selected section only</p>
            </button>
            <button
              onClick={() => setVisibility('grade')}
              className={`p-5 rounded-xl border-2 transition-all duration-300 hover:scale-[1.02] ${
                visibility === 'grade'
                  ? 'border-primary-400 bg-primary-50'
                  : 'border-background-200 bg-background-50 hover:border-background-300'
              }`}
            >
              <h3 className="font-heading font-bold text-foreground-900 mb-1">Entire Grade Level</h3>
              <p className="text-xs text-foreground-600 font-body">All sections in this grade</p>
            </button>
            <button
              onClick={() => setVisibility('all')}
              className={`p-5 rounded-xl border-2 transition-all duration-300 hover:scale-[1.02] ${
                visibility === 'all'
                  ? 'border-secondary-400 bg-secondary-50'
                  : 'border-background-200 bg-background-50 hover:border-background-300'
              }`}
            >
              <h3 className="font-heading font-bold text-foreground-900 mb-1">All Grades & Sections</h3>
              <p className="text-xs text-foreground-600 font-body">Visible to everyone</p>
            </button>
          </div>
        </section>

        {/* Include Quiz Section */}
        <section className="bg-background-50 rounded-2xl border border-background-200/70 p-6 animate-fadeInUp" style={{ animationDelay: '500ms' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center text-xl">❓</div>
              <div>
                <h2 className="text-lg font-heading font-bold text-foreground-900">Include Quiz Section</h2>
                <p className="text-sm text-foreground-600 font-body">Add structured assessment questions to the activity</p>
              </div>
            </div>
            <button
              onClick={() => setIncludeQuiz(!includeQuiz)}
              className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${
                includeQuiz ? 'bg-accent-500' : 'bg-background-300'
              }`}
            >
              <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-transform duration-300 ${
                includeQuiz ? 'left-7' : 'left-1'
              }`} />
            </button>
          </div>
        </section>

        {/* Rewards Configuration */}
        <section className="bg-background-50 rounded-2xl border border-background-200/70 p-6 animate-fadeInUp" style={{ animationDelay: '600ms' }}>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center text-xl">🏆</div>
            <h2 className="text-xl font-heading font-bold text-foreground-900">Rewards Configuration</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-foreground-700 mb-2 font-body">Assign Points</label>
              <input 
                type="number" 
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-background-300 bg-background-50 focus:outline-none focus:ring-2 focus:ring-primary-300 font-body"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground-700 mb-2 font-body">Assign Badge (Optional)</label>
              <input 
                type="text" 
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="e.g., Math Master"
                className="w-full px-4 py-3 rounded-xl border border-background-300 bg-background-50 focus:outline-none focus:ring-2 focus:ring-primary-300 font-body"
              />
            </div>
          </div>
        </section>

        {/* Save Button */}
        <button
          type="button"
          onClick={handleSaveActivity}
          disabled={saving}
          className="w-full py-4 bg-accent-500 text-white font-bold text-lg rounded-2xl transition-all duration-300 hover:bg-accent-600 hover:scale-[1.01] font-body flex items-center justify-center gap-3 animate-fadeInUp whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-60"
          style={{ animationDelay: '700ms' }}
        >
          <Icon type="save" className="h-6 w-6" />
          {saving ? 'Saving Activity...' : 'Save Activity'}
        </button>
      </div>
    </div>
  );
}
