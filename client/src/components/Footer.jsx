import React from 'react';
import { Link } from 'react-router-dom';

const TwitterIcon = () => <img src="https://img.icons8.com/?size=100&id=fJp7hepMryiw&format=png&color=FFFFFF" className='w-6 h-6' alt='twitter' />;
const FacebookIcon = () => <img src="https://img.icons8.com/?size=100&id=118467&format=png&color=FFFFFF" className='w-6 h-6' alt='facebook' />;
const InstagramIcon = () => <img src="https://img.icons8.com/?size=100&id=sIjAGWOh8bN8&format=png&color=FFFFFF" className='w-6 h-6' alt='instagram' />;

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <h3 className="text-lg font-bold mb-4">Parkezy</h3>
            <p className="text-gray-400 text-sm">The easiest way to find, book, and manage parking spots.</p>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="text-gray-400 hover:text-white"><TwitterIcon /></a>
              <a href="#" className="text-gray-400 hover:text-white"><FacebookIcon /></a>
              <a href="#" className="text-gray-400 hover:text-white"><InstagramIcon /></a>
            </div>
          </div>
          <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
                <li><Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors">Find Parking</Link></li>
                <li><Link to="/owner-dashboard" className="text-gray-400 hover:text-white transition-colors">List Your Space</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Contact Us</h3>
              <ul className="space-y-2 text-sm">
                <li className="text-gray-400">123 Parking Lane,</li>
                <li className="text-gray-400">Lucknow, UP, India</li>
                <li className="text-gray-400">Email: support@parkezy.com</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Parkezy. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};


export default Footer;