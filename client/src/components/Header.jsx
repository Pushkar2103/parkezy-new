import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// --- ICONS ---
const CarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 16.5V18a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-1.5"/><path d="M4 10h16"/><path d="M4 6h16"/><path d="M19 6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v4l-3 6v2h22v-2l-3-6V6Z"/></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const LogOutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const MenuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>;
const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;


const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/'); // Redirect to landing page after logout
  };

  const activeLinkStyle = {
    color: '#2563EB', // blue-600
    borderBottom: '2px solid #2563EB'
  };

  const dashboardPath = user?.role === 'owner' ? '/owner-dashboard' : '/dashboard';

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <CarIcon />
          <span className="text-2xl font-bold text-blue-600">Parkezy</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6">
          {isAuthenticated ? (
            <>
              <NavLink to={dashboardPath} style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="text-gray-600 hover:text-blue-600 font-medium pb-1 transition-colors">
                Dashboard
              </NavLink>
              {/* Add other links here e.g. /bookings */}
              <div className="flex items-center space-x-2">
                <UserIcon />
                <span>{user.name}</span>
              </div>
              <button onClick={handleLogout} className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
                <LogOutIcon />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="text-gray-600 hover:text-blue-600 font-medium">Login</NavLink>
              <NavLink to="/register" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
                Register
              </NavLink>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white py-4 px-4 border-t">
          {isAuthenticated ? (
            <div className="flex flex-col space-y-4">
              <NavLink to={dashboardPath} onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 hover:text-blue-600 font-medium pb-1">
                Dashboard
              </NavLink>
              <div className="flex items-center space-x-2 border-t pt-4">
                <UserIcon />
                <span>{user.name}</span>
              </div>
              <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="flex items-center justify-center space-x-2 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
                <LogOutIcon />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col space-y-4">
              <NavLink to="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 hover:text-blue-600 font-medium block text-center py-2">Login</NavLink>
              <NavLink to="/register" onClick={() => setIsMobileMenuOpen(false)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 block text-center">
                Register
              </NavLink>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
