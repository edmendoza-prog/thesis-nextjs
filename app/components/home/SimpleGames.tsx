import Image from 'next/image';

export default function SimpleGames() {
  const games = [
    {
      title: 'Palosebo Race',
      desc: 'Teams climb the greased bamboo pole with every correct answer in this festive educational race.',
      image: '/images/palosebo_race_cover.jpg',
      badge: 'Live Team Battle',
    },
    {
      title: 'Tug of War',
      desc: 'Pupils pull together in red and blue teams, earning rope progress with rapid knowledge answers.',
      image: '/images/tug_of_war_cover.jpg',
      badge: 'Team Showdown',
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-amber-700 uppercase tracking-widest bg-amber-100/70 px-3 py-1 rounded-full">
            Gamified Learning
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-3 mb-2">
            Live Classroom Games
          </h2>
          <p className="text-sm text-slate-600">
            Keep Grade 1–3 pupils energized with interactive multiplayer challenges that reinforce daily lessons.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {games.map((g) => (
            <div
              key={g.title}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col"
            >
              <div className="relative aspect-video w-full bg-slate-100 overflow-hidden">
                <Image
                  src={g.image}
                  alt={`${g.title} game art`}
                  fill
                  sizes="(max-width: 768px) 100vw, 540px"
                  className="object-cover object-center"
                />
                <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-slate-900 font-bold text-[11px] px-2.5 py-1 rounded-md shadow-2xs">
                  {g.badge}
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">
                    {g.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {g.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
