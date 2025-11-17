import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useUser, useClerk } from "@clerk/clerk-react";
import { Button } from "../ui";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user } = useUser();
  const { signOut } = useClerk();
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    await signOut();
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 py-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="text-green-600 font-bold text-lg">
            Escrow
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <Button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center justify-center w-10 h-10 cursor-pointer !rounded-full bg-[#9fe870] text-[#163300] font-semibold hover:bg-[#65cf21] focus:outline-none"
                >
                  {user.firstName
                    ? user.firstName.charAt(0).toUpperCase()
                    : user.emailAddress?.emailAddress.charAt(0).toUpperCase()}
                </Button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-6 w-56 bg-white shadow-md rounded-xl shadow-lg py-2 animate-fadeIn">
                    <div className="px-4 py-2 text-sm border-b">
                      <p className="font-semibold text-gray-800 truncate">
                        {user.emailAddress
                          ? user.emailAddress.emailAddress
                          : user.primaryEmailAddress?.emailAddress}
                      </p>
                    </div>

                    <Link
                      to="/verify-profile"
                      className="block px-4 py-2 text-sm text-yellow-600 hover:bg-gray-100"
                    >
                     Verify my account
                    </Link>

                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      My profile
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="block w-full text-left cursor-pointer px-4 py-2 text-md text-[#163300] hover:bg-gray-100"
                    >
                      Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-[#65cf21]">
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="px-3 py-1 rounded bg-[#9fe870] text-[#163300] hover:bg-[#65cf21]"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700 focus:outline-none"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <nav className="flex flex-col space-y-2 px-4 py-3">
            <Link to="/" className="text-gray-700 hover:text-[#65cf21]">
              Home
            </Link>
            <Link
              to="/create-deal"
              className="text-gray-700 hover:text-[#65cf21]"
            >
              Create Deal
            </Link>
            <Link
              to="/transactions"
              className="text-gray-700 hover:text-[#65cf21]"
            >
              Transactions
            </Link>
            <Link
              to="/support"
              className="text-gray-700 hover:text-[#65cf21]"
            >
              Support
            </Link>
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="px-3 py-1 rounded bg-[#9fe870] text-white hover:bg-[#65cf21]"
                >
                  Dashboard
                </Link>
                <Button
                  onClick={handleLogout}
                  className="text-left text-[#163300] cursor-pointer font-semibold hover:text-red-500"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-[#163300] font-semibold hover:text-[#65cf21]"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-3 py-1 rounded bg-[#9fe870] text-[#163300] hover:bg-[#65cf21]"
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
