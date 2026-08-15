'use client';

const activities = [
  {
    id: 'spin-wheel',
    title: 'Spin the Wheel',
    description: 'Random student selector with rewards',
    color: 'from-primary-400 to-primary-600',
    icon: '🎡',
    buttonColor: 'bg-primary-500 hover:bg-primary-600',
  },
  {
    id: 'racing-game',
    title: 'Racing Game',
    description: 'Fast-paced team competition challenge',
    color: 'from-accent-400 to-accent-600',
    icon: '🏁',
    buttonColor: 'bg-accent-500 hover:bg-accent-600',
  },
  {
    id: 'quiz-battle',
    title: 'Quiz Battle',
    description: 'Live classroom quiz showdown',
    color: 'from-secondary-400 to-secondary-600',
    icon: '🎯',
    buttonColor: 'bg-secondary-500 hover:bg-secondary-600',
  },
];

const howToSteps = [
  { number: 1, title: 'Choose an activity', description: 'Click on any game card above', color: 'bg-primary-500' },
  { number: 2, title: 'Prepare the class', description: 'Set the game rules and participants', color: 'bg-accent-500' },
  { number: 3, title: 'Launch the session', description: 'Start and display it for the class', color: 'bg-secondary-500' },
  { number: 4, title: 'Track results', description: 'Celebrate winners and review progress', color: 'bg-[#f97316]' },
];

function Icon({ type, className = "h-5 w-5" }: { type: string; className?: string }) {
  switch (type) {
    case 'gamepad':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="6" x2="10" y1="11" y2="11" /><line x1="8" x2="8" y1="9" y2="13" /><line x1="15" x2="15.01" y1="12" y2="12" /><line x1="18" x2="18.01" y1="10" y2="10" /><path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5Z" /></svg>;
    case 'arrow-right':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14m-7-7 7 7-7 7" /></svg>;
    default:
      return null;
  }
}

export default function LiveClassActivitiesPage() {
  return (
    <div className="max-w-6xl">
      {/* Header */}
      <header className="mb-6 animate-fadeInUp">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#f97316] flex items-center justify-center">
            <Icon type="gamepad" className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-4xl font-heading font-bold text-foreground-900">Live Class Activities</h1>
        </div>
      </header>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-primary-100 to-primary-200 rounded-2xl border border-primary-300/50 p-6 mb-6 animate-fadeInUp" style={{ animationDelay: '100ms' }}>
        <h2 className="font-heading font-bold text-xl text-foreground-900 mb-2">Teacher-Controlled Activities</h2>
        <p className="text-foreground-700 font-body">
          These activities are designed for live classroom presentation. You control the game while students participate together!
        </p>
      </div>

      {/* Activity Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {activities.map((activity, idx) => (
          <div
            key={activity.id}
            className="bg-background-50 rounded-2xl border border-background-200/70 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg animate-fadeInUp"
            style={{ animationDelay: `${(idx + 2) * 100}ms` }}
          >
            {/* Colored Top Section */}
            <div className={`h-32 bg-gradient-to-br ${activity.color} flex items-center justify-center`}>
              <div className="text-6xl">{activity.icon}</div>
            </div>

            {/* White Body */}
            <div className="p-5">
              <h3 className="font-heading font-bold text-xl text-foreground-900 mb-2">{activity.title}</h3>
              <p className="text-sm text-foreground-600 font-body mb-4">{activity.description}</p>
              <button className={`w-full py-3 ${activity.buttonColor} text-white font-bold rounded-xl transition-all duration-300 font-body flex items-center justify-center gap-2 whitespace-nowrap`}>
                Start Activity
                <Icon type="arrow-right" className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* How to Use */}
      <section className="bg-background-50 rounded-2xl border border-background-200/70 p-6 animate-fadeInUp" style={{ animationDelay: '500ms' }}>
        <div className="flex items-center gap-2 mb-6">
          <div className="text-3xl">💡</div>
          <h2 className="text-2xl font-heading font-bold text-foreground-900">How to Use Live Activities</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {howToSteps.map((step) => (
            <div key={step.number} className="flex items-start gap-4 p-4 rounded-xl bg-background-100 hover:bg-background-200 transition-colors">
              <div className={`w-10 h-10 rounded-full ${step.color} flex items-center justify-center flex-shrink-0`}>
                <span className="text-white font-heading font-bold text-lg">{step.number}</span>
              </div>
              <div>
                <h3 className="font-heading font-bold text-foreground-900 mb-1">{step.title}</h3>
                <p className="text-sm text-foreground-600 font-body">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
