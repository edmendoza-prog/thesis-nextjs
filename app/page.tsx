import Navigation from './components/Navigation';
import SimpleHero from './components/home/SimpleHero';
import SimpleFeatures from './components/home/SimpleFeatures';
import SimpleHowItWorks from './components/home/SimpleHowItWorks';
import SimpleGames from './components/home/SimpleGames';
import SimpleCta from './components/home/SimpleCta';
import Footer from './components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col selection:bg-sky-500 selection:text-white">
      <Navigation />
      <main className="flex-grow">
        <SimpleHero />
        <SimpleFeatures />
        <SimpleHowItWorks />
        <SimpleGames />
        <SimpleCta />
      </main>
      <Footer />
    </div>
  );
}
