import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import HowItWorks from '../components/HowItWorks';
import Features from '../components/Features';
import Testimonials from '../components/Testimonials';
import Footer from '../components/Footer';

const Home = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="home-container">
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
