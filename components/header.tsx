'use client';

import React, { useState, useEffect } from 'react';
import { 
  Home,
  Building,
  Info,
  Briefcase,
  Mail,
  ChevronDown,
  Globe
} from 'lucide-react';
import Link from 'next/link';

export function FlexHeader() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white border-b border-gray-100' 
        : 'bg-[#2D5A5A]'
    }`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className={`flex items-center transition-colors ${
              isScrolled 
                ? 'text-gray-900 hover:text-gray-700' 
                : 'text-white hover:text-gray-200'
            }`}>
              <Home className="h-6 w-6 mr-2" />
              <span className="text-lg font-medium">the flex.</span>
            </Link>
          </div>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <div className={`flex items-center cursor-pointer transition-colors ${
              isScrolled 
                ? 'text-gray-700 hover:text-gray-900' 
                : 'text-white hover:text-gray-200'
            }`}>
              <Building className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">Landlords</span>
              <ChevronDown className="h-3 w-3 ml-1" />
            </div>
            
            <Link href="/about" className={`flex items-center transition-colors ${
              isScrolled 
                ? 'text-gray-700 hover:text-gray-900' 
                : 'text-white hover:text-gray-200'
            }`}>
              <Info className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">About Us</span>
            </Link>
            
            <Link href="/careers" className={`flex items-center transition-colors ${
              isScrolled 
                ? 'text-gray-700 hover:text-gray-900' 
                : 'text-white hover:text-gray-200'
            }`}>
              <Briefcase className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">Careers</span>
            </Link>
            
            <Link href="/contact" className={`flex items-center transition-colors ${
              isScrolled 
                ? 'text-gray-700 hover:text-gray-900' 
                : 'text-white hover:text-gray-200'
            }`}>
              <Mail className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">Contact</span>
            </Link>
          </nav>
          
          {/* Language & Currency */}
          <div className="flex items-center space-x-4">
            <div className={`hidden md:flex items-center cursor-pointer transition-colors ${
              isScrolled 
                ? 'text-gray-700 hover:text-gray-900' 
                : 'text-white hover:text-gray-200'
            }`}>
              <span className="mr-1">🇬🇧</span>
              <span className="text-sm font-medium">English</span>
            </div>
            
            <div className={`flex items-center cursor-pointer transition-colors ${
              isScrolled 
                ? 'text-gray-700 hover:text-gray-900' 
                : 'text-white hover:text-gray-200'
            }`}>
              <span className="text-sm font-medium">£ GBP</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
