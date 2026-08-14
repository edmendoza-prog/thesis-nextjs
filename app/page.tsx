import Navigation from './components/Navigation';
import SocialSidebar from './components/SocialSidebar';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import Footer from './components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <SocialSidebar />
      <HeroSection />
      <FeaturesSection />
      <Footer />
    </div>
  );
}
