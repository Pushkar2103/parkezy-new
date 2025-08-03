import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const OwnerDashboard = () => {
    const { requestCount } = useAuth();
    const location = useLocation();

    const activeLinkStyle = {
        backgroundColor: '#2563EB', // blue-600
        color: 'white',
    };

    const isBaseDashboard = location.pathname === '/owner-dashboard';

    return (
        <div className="container mx-auto">
            <h1 className="text-4xl font-bold mb-6">Owner Dashboard</h1>
            
            <div className="flex flex-wrap space-x-2 border-b mb-6 pb-2">
                <NavLink 
                    to="/owner-dashboard" 
                    style={() => isBaseDashboard ? activeLinkStyle : undefined}
                    className="px-4 py-2 font-semibold rounded-md transition-colors text-gray-600 hover:bg-blue-100"
                >
                    Dashboard
                </NavLink>
                <NavLink 
                    to="/owner-dashboard/parkings" 
                    style={({ isActive }) => isActive ? activeLinkStyle : undefined}
                    className="px-4 py-2 font-semibold rounded-md transition-colors text-gray-600 hover:bg-blue-100"
                >
                    My Parkings
                </NavLink>
                <NavLink 
                    to="/owner-dashboard/add-parking" 
                    style={({ isActive }) => isActive ? activeLinkStyle : undefined}
                    className="px-4 py-2 font-semibold rounded-md transition-colors text-gray-600 hover:bg-blue-100"
                >
                    Add New Parking
                </NavLink>
                <NavLink 
                    to="/owner-dashboard/requests" 
                    style={({ isActive }) => isActive ? activeLinkStyle : undefined}
                    className="relative px-4 py-2 font-semibold rounded-md transition-colors text-gray-600 hover:bg-blue-100"
                >
                    Requests
                    {requestCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{requestCount}</span>
                    )}
                </NavLink>
            </div>
            
            <Outlet />
        </div>
    );
};

export default OwnerDashboard;
