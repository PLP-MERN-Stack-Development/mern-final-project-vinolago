// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { useUser, useAuth as useClerkAuth } from "@clerk/clerk-react";
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const { user, isLoaded } = useUser();
    const { getToken } = useClerkAuth();
    const [userRole, setUserRole] = useState(null);
    const [roleLoading, setRoleLoading] = useState(true);
    const [isVerified, setIsVerified] = useState(false);
    const [profileComplete, setProfileComplete] = useState(false);

    // Fetch user role from backend when user is loaded
    const fetchUserRole = async () => {
        if (!user || !isLoaded) {
            setRoleLoading(false);
            setIsVerified(false);
            setProfileComplete(false);
            return;
        }

        try {
            const token = await getToken();
            const response = await axios.get('http://localhost:5000/api/auth/me', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUserRole(response.data.role);
            setIsVerified(response.data.isVerified || false);
            setProfileComplete(response.data.profileComplete || false);
        } catch (error) {
            console.error('Error fetching user role:', error);
            setUserRole('buyer'); // Default to buyer if error
            setIsVerified(false);
            setProfileComplete(false);
        } finally {
            setRoleLoading(false);
        }
    };

    useEffect(() => {
        fetchUserRole();
    }, [user, isLoaded, getToken]);

    // Provide Clerk user data, token getter, and role information
    const value = {
      user,
      loading: !isLoaded || roleLoading,
      getToken: getToken,
      isAuthenticated: !!user,
      role: userRole,
      isAdmin: userRole === 'admin',
      isVerified,
      profileComplete,
      refreshUser: fetchUserRole
    };

    return (
      <AuthContext.Provider value={value}>
        {children}
      </AuthContext.Provider>
    );
}

export function useAuth() {
  return useContext(AuthContext);
}
