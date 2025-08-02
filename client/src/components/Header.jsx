import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const CarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 16.5V18a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-1.5"/><path d="M4 10h16"/><path d="M4 6h16"/><path d="M19 6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v4l-3 6v2h22v-2l-3-6V6Z"/></svg>;
const UserCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-500 group-hover:text-blue-600 transition"><path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const ChevronDownIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 ml-1 text-gray-500 group-hover:text-blue-600 transition"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>;

const ProfileDropdown = () => {
    const { user, logout, requestCount } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleLogout = () => {
        logout();
        setIsOpen(false);
        navigate('/');
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    const dashboardPath = user?.role === 'owner' ? '/owner-dashboard' : '/dashboard';

    return (
        <div className="relative" ref={dropdownRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="group flex items-center space-x-2">
                <div className="relative">
                    <UserCircleIcon />
                    {user?.role === 'owner' && requestCount > 0 && (
                        <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-red-500 border-2 border-white"></span>
                    )}
                </div>
                <span className="hidden sm:inline font-medium text-gray-700 group-hover:text-blue-600 transition">{user.name}</span>
                <ChevronDownIcon />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl z-50 overflow-hidden border">
                    <div className="p-2 border-b">
                        <p className="font-semibold text-sm text-gray-800">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <div className="py-1">
                        <NavLink to={dashboardPath} onClick={() => setIsOpen(false)} className={({isActive}) => `block px-4 py-2 text-sm text-gray-700 hover:bg-blue-500 hover:text-white ${isActive && 'bg-blue-50'}`}>Dashboard</NavLink>
                        <NavLink to="/profile" onClick={() => setIsOpen(false)} className={({isActive}) => `block px-4 py-2 text-sm text-gray-700 hover:bg-blue-500 hover:text-white ${isActive && 'bg-blue-50'}`}>My Profile</NavLink>
                        {user.role === 'owner' && <NavLink to="/owner-dashboard/requests" onClick={() => setIsOpen(false)} className={({isActive}) => `flex justify-between items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-500 hover:text-white ${isActive && 'bg-blue-50'}`}>Requests {requestCount > 0 && <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{requestCount}</span>}</NavLink>}
                        {user.role === 'user' && <NavLink to="/my-bookings" onClick={() => setIsOpen(false)} className={({isActive}) => `block px-4 py-2 text-sm text-gray-700 hover:bg-blue-500 hover:text-white ${isActive && 'bg-blue-50'}`}>My Bookings</NavLink>}
                    </div>
                    <div className="border-t">
                        <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-500 hover:text-white">Logout</button>
                    </div>
                </div>
            )}
        </div>
    );
};

const Header = () => {
  const { isAuthenticated } = useAuth();
  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <nav className="container mx-auto px-4 md:px-8 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <CarIcon />
          <span className="text-2xl font-bold text-blue-600">Parkezy</span>
        </Link>
        <div>
          {isAuthenticated ? (
            <ProfileDropdown />
          ) : (
            <div className="flex items-center space-x-2">
              <NavLink to="/login" className="text-gray-600 hover:text-blue-600 font-medium py-2 px-3 rounded-md">Login</NavLink>
              <NavLink to="/register" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">Register</NavLink>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
