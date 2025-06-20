import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Search, Menu, X, Globe, Sun, Moon, Home, Settings } from 'lucide-react';

const Navbar: React.FC = () => {
  const { t, language, changeLanguage, isRtl } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user, isAdmin, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  useEffect(() => {
    setMobileMenuOpen(false);
    setLanguageMenuOpen(false);
    setUserMenuOpen(false);
  }, [location]);

  const languages = [
    { code: 'en-us', label: 'English (US)' },
    { code: 'en-gb', label: 'English (UK)' },
    { code: 'ar', label: 'العربية' }
  ];

  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  return (
    <header 
      className={`fixed w-full z-50 transition-all duration-500 ${
        isScrolled 
          ? 'py-2' 
          : 'py-4'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`relative backdrop-blur-md bg-white/10 dark:bg-gray-900/10 rounded-full shadow-lg transition-all duration-500 ${
          isScrolled ? 'py-2' : 'py-3'
        }`}>
          <div className="flex items-center justify-between px-6">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <Home className="w-8 h-8 text-gray-900 dark:text-white" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">HomeVista</span>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link 
                to="/"
                onClick={handleHomeClick}
                className="text-gray-900 dark:text-white hover:text-primary-DEFAULT transition-colors duration-300 text-sm uppercase tracking-wider"
              >
                Home
              </Link>
              {['Tours', 'Explore', 'About Us', 'Contact'].map((item) => (
                <Link 
                  key={item}
                  to={`/${item.toLowerCase().replace(' ', '-')}`}
                  className="text-gray-900 dark:text-white hover:text-primary-DEFAULT transition-colors duration-300 text-sm uppercase tracking-wider"
                >
                  {item}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="text-gray-900 dark:text-white hover:text-primary-DEFAULT transition-colors duration-300 text-sm uppercase tracking-wider"
                >
                  Admin Panel
                </Link>
              )}
            </nav>
            
            {/* Right Section */}
            <div className="hidden md:flex items-center space-x-4">
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-full text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
              <div className="relative">
                <button 
                  onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
                  className="p-2 rounded-full text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                >
                  <Globe className="w-5 h-5" />
                </button>
                
                {languageMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5">
                    <div className="py-1" role="menu">
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            changeLanguage(lang.code as 'en-us' | 'en-gb' | 'ar');
                            setLanguageMenuOpen(false);
                          }}
                          className={`${
                            language === lang.code ? 'bg-gray-100 dark:bg-gray-700 text-primary-DEFAULT' : 'text-gray-900 dark:text-white'
                          } group flex w-full items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700`}
                          role="menuitem"
                        >
                          {lang.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-2 p-2 rounded-full text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5">
                      <div className="py-1">
                        {isAdmin && (
                          <Link
                            to="/admin"
                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            Admin Panel
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="bg-primary-DEFAULT hover:bg-primary-dark text-white px-6 py-2 rounded-full transition-all duration-300 transform hover:scale-105"
                >
                  Login
                </Link>
              )}
            </div>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-full text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
          
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 p-4 backdrop-blur-md bg-white/10 dark:bg-gray-900/10 rounded-2xl shadow-lg border border-white/10">
              <nav className="flex flex-col space-y-4">
                <Link 
                  to="/"
                  onClick={handleHomeClick}
                  className="text-gray-900 dark:text-white hover:text-primary-DEFAULT transition-colors duration-300 text-sm uppercase tracking-wider"
                >
                  Home
                </Link>
                {['Tours', 'Explore', 'About Us', 'Contact'].map((item) => (
                  <Link 
                    key={item}
                    to={`/${item.toLowerCase().replace(' ', '-')}`}
                    className="text-gray-900 dark:text-white hover:text-primary-DEFAULT transition-colors duration-300 text-sm uppercase tracking-wider"
                  >
                    {item}
                  </Link>
                ))}
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="text-gray-900 dark:text-white hover:text-primary-DEFAULT transition-colors duration-300 text-sm uppercase tracking-wider"
                  >
                    Admin Panel
                  </Link>
                )}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  {user ? (
                    <button
                      onClick={handleLogout}
                      className="w-full bg-primary-DEFAULT hover:bg-primary-dark text-white px-6 py-2 rounded-full transition-all duration-300 transform hover:scale-105"
                    >
                      Logout
                    </button>
                  ) : (
                    <Link
                      to="/login"
                      className="block w-full bg-primary-DEFAULT hover:bg-primary-dark text-white px-6 py-2 rounded-full text-center transition-all duration-300 transform hover:scale-105"
                    >
                      Login
                    </Link>
                  )}
                </div>
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;