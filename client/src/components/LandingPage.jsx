import React from 'react';
import { Link } from 'react-router-dom';

// --- ICONS ---
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const DollarSignIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>;
const KeyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H5v-2H3v-2H1v-2h2v-2h2v-2h2v-2h2l2.05-2.05A6 6 0 0115 7z" /></svg>;
const ArrowRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>;


const LandingPage = () => {
  return (
    <div className="bg-white text-gray-800">
      {/* Hero Section */}
      <section className="relative text-white">
        <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: "url('https://images.unsplash.com/photo-1543361468-16b661b95282?q=80&w=2070&auto=format&fit=crop')"}}></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-800/80 to-blue-500/70"></div>
        <div className="container mx-auto px-4 py-24 md:py-32 text-center relative">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">Parking, Perfected.</h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto mb-8">
            Find and book your ideal parking spot in seconds, or turn your empty space into extra cash. Parkezy makes it simple.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link 
              to="/dashboard" 
              className="group bg-white text-blue-600 font-bold py-3 px-8 rounded-full text-lg shadow-lg hover:bg-gray-100 transform hover:scale-105 transition-transform duration-300 flex items-center"
            >
              Find a Spot Now
              <ArrowRightIcon />
            </Link>
            <Link 
              to="/register" 
              className="bg-transparent border-2 border-white text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg hover:bg-white hover:text-blue-600 transition-colors duration-300"
            >
              List Your Space
            </Link>
          </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="text-center md:text-left">
              <span className="text-blue-600 font-semibold">FOR DRIVERS</span>
              <h2 className="text-3xl md:text-4xl font-bold my-3">Never Circle the Block Again</h2>
              <p className="text-gray-600 text-lg mb-6">
                Say goodbye to parking stress. With Parkezy, you can find, reserve, and pay for your spot in advance. Get to your destination faster and with a guaranteed space waiting for you.
              </p>
              <Link to="/dashboard" className="text-blue-600 font-bold text-lg hover:underline">Explore Parking Areas &rarr;</Link>
            </div>
            <div>
              <img src="https://images.unsplash.com/photo-1615840287214-7ff58936c4cf?q=80&w=1887&auto=format&fit=crop" alt="Happy driver" className="rounded-xl shadow-2xl"/>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mt-24">
            <div className="order-2 md:order-1">
              <img src="https://images.unsplash.com/photo-1587090431354-a579a8344646?q=80&w=1887&auto=format&fit=crop" alt="Parking space owner" className="rounded-xl shadow-2xl"/>
            </div>
            <div className="text-center md:text-left order-1 md:order-2">
              <span className="text-green-600 font-semibold">FOR OWNERS</span>
              <h2 className="text-3xl md:text-4xl font-bold my-3">Turn Your Empty Space into Income</h2>
              <p className="text-gray-600 text-lg mb-6">
                Have an empty driveway or a private parking spot? List it on Parkezy and start earning passive income. You set the price and availability—we handle the rest.
              </p>
              <Link to="/register" className="text-green-600 font-bold text-lg hover:underline">Become a Host &rarr;</Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Get Started in 3 Simple Steps</h2>
            <p className="text-gray-600">Parking has never been this easy.</p>
          </div>
          <div className="flex flex-col md:flex-row justify-center items-start text-center gap-8 md:gap-16">
            <div className="flex flex-col items-center max-w-xs">
              <div className="flex items-center justify-center h-20 w-20 rounded-full bg-blue-100 text-blue-600 mb-4"><SearchIcon /></div>
              <h3 className="text-xl font-semibold mb-2">1. Find</h3>
              <p className="text-gray-600">Use our interactive map to search for available spots near your destination.</p>
            </div>
            <div className="flex flex-col items-center max-w-xs">
              <div className="flex items-center justify-center h-20 w-20 rounded-full bg-blue-100 text-blue-600 mb-4"><KeyIcon /></div>
              <h3 className="text-xl font-semibold mb-2">2. Book</h3>
              <p className="text-gray-600">Select your time, confirm your details, and securely book your slot in just a few clicks.</p>
            </div>
            <div className="flex flex-col items-center max-w-xs">
              <div className="flex items-center justify-center h-20 w-20 rounded-full bg-blue-100 text-blue-600 mb-4"><DollarSignIcon /></div>
              <h3 className="text-xl font-semibold mb-2">3. Park & Earn</h3>
              <p className="text-gray-600">Arrive at your spot stress-free. If you're an owner, watch the earnings roll in.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="bg-blue-600">
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Join the Parking Revolution?</h2>
          <p className="text-blue-200 mb-8 max-w-xl mx-auto">Whether you're looking for a spot or have one to share, get started with Parkezy today.</p>
          <Link 
              to="/register" 
              className="bg-white text-blue-600 font-bold py-3 px-8 rounded-full text-lg shadow-lg hover:bg-gray-100 transform hover:scale-105 transition-transform duration-300"
            >
              Sign Up Now
            </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
