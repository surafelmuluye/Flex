'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Facebook, 
  Instagram, 
  Linkedin, 
  MessageCircle,
  ChevronDown,
  Plane,
  Phone,
  Mail
} from 'lucide-react';
import Link from 'next/link';

export function FlexFooter() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    countryCode: '+44'
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log('Newsletter subscription:', formData);
  };

  return (
    <>
      <footer className="bg-[#2D5A5A] text-white relative">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            
            {/* Join The Flex - Newsletter Signup */}
            <div className="lg:col-span-1">
              <h3 className="text-white text-base font-normal mb-4">Join The Flex</h3>
              <p className="text-gray-300 mb-6 text-sm leading-relaxed font-light">
                Sign up now and stay up to date on our latest news and exclusive deals including 5% off your first stay!
              </p>
              
              <form onSubmit={handleSubscribe} className="space-y-4">
                {/* First Name & Last Name Row */}
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="First name"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="w-full bg-transparent border border-gray-400/40 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-400 focus:border-gray-300 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="w-full bg-transparent border border-gray-400/40 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-400 focus:border-gray-300 focus:outline-none"
                  />
                </div>
                
                {/* Email */}
                <input
                  type="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full bg-transparent border border-gray-400/40 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-400 focus:border-gray-300 focus:outline-none"
                />
                
                {/* Phone with Country Code */}
                <div className="flex">
                  <div className="relative">
                    <select
                      value={formData.countryCode}
                      onChange={(e) => handleInputChange('countryCode', e.target.value)}
                      className="bg-transparent border border-gray-400/40 border-r-0 rounded-l-lg px-4 py-3 text-sm text-white focus:border-gray-300 focus:outline-none appearance-none pr-10"
                    >
                      <option value="+44" className="bg-[#2D5A5A] text-white">🇬🇧 +44</option>
                      <option value="+33" className="bg-[#2D5A5A] text-white">🇫🇷 +33</option>
                      <option value="+213" className="bg-[#2D5A5A] text-white">🇩🇿 +213</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                  <input
                    type="tel"
                    placeholder="Phone number"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="flex-1 bg-transparent border border-gray-400/40 border-l-0 rounded-r-lg px-4 py-3 text-sm text-white placeholder-gray-400 focus:border-gray-300 focus:outline-none"
                  />
                </div>
                
                {/* Subscribe Button */}
                <button 
                  type="submit"
                  className="w-full bg-white text-[#2D5A5A] hover:bg-gray-50 font-normal py-3 px-4 rounded-lg flex items-center justify-center text-sm transition-all duration-200 border-0 focus:outline-none focus:ring-2 focus:ring-white/20"
                >
                  <Plane className="h-4 w-4 mr-2" />
                  Subscribe
                </button>
              </form>
            </div>

            {/* The Flex */}
            <div className="lg:col-span-1">
              <h4 className="text-white text-base font-normal mb-4">The Flex</h4>
              <p className="text-gray-300 text-sm leading-relaxed mb-6 font-light">
                Professional property management services for landlords, flexible corporate lets for businesses and quality accommodations for short-term and long-term guests.
              </p>
              
              {/* Social Media Icons */}
              <div className="flex space-x-3">
                <Link href="#" className="text-gray-300 hover:text-white transition-colors">
                  <Facebook className="h-4 w-4" />
                </Link>
                <Link href="#" className="text-gray-300 hover:text-white transition-colors">
                  <Instagram className="h-4 w-4" />
                </Link>
                <Link href="#" className="text-gray-300 hover:text-white transition-colors">
                  <Linkedin className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Quick Links */}
            <div className="lg:col-span-1">
              <h4 className="text-white text-base font-normal mb-4">Quick Links</h4>
              <div className="space-y-2">
                <div>
                  <Link href="/blog" className="text-gray-300 hover:text-white text-sm transition-colors font-light">
                    Blog
                  </Link>
                </div>
                <div>
                  <Link href="/careers" className="text-gray-300 hover:text-white text-sm transition-colors font-light">
                    Careers
                  </Link>
                </div>
                <div>
                  <Link href="/terms" className="text-gray-300 hover:text-white text-sm transition-colors font-light">
                    Terms & Conditions
                  </Link>
                </div>
                <div>
                  <Link href="/privacy" className="text-gray-300 hover:text-white text-sm transition-colors font-light">
                    Privacy Policy
                  </Link>
                </div>
              </div>
            </div>

            {/* Locations */}
            <div className="lg:col-span-1">
              <h4 className="text-white text-base font-normal mb-4">Locations</h4>
              <div className="space-y-2 text-sm">
                <div className="text-gray-300 font-normal">LONDON</div>
                <div className="text-gray-300 font-normal">PARIS</div>
                <div className="text-gray-300 font-normal">ALGIERS</div>
              </div>
            </div>

            {/* Contact Us */}
            <div className="lg:col-span-1">
              <h4 className="text-white text-base font-normal mb-4">Contact Us</h4>
              
              {/* Support Numbers */}
              <div className="mb-4">
                <div className="flex items-center text-gray-300 text-sm mb-3">
                  <Phone className="h-4 w-4 mr-2" />
                  <span className="font-normal">Support Numbers</span>
                </div>
              </div>

              {/* Country Contact Details */}
              <div className="space-y-3 text-sm">
                <div>
                  <div className="flex items-center text-gray-300 mb-1">
                    <span className="mr-2">🇬🇧</span>
                    <span className="font-light">United Kingdom</span>
                  </div>
                  <div className="text-gray-300 ml-6 font-light">+44 77 2374 5646</div>
                </div>
                
                <div>
                  <div className="flex items-center text-gray-300 mb-1">
                    <span className="mr-2">🇩🇿</span>
                    <span className="font-light">Algeria</span>
                  </div>
                  <div className="text-gray-300 ml-6 font-light">+33 7 57 59 22 41</div>
                </div>
                
                <div>
                  <div className="flex items-center text-gray-300 mb-1">
                    <span className="mr-2">🇫🇷</span>
                    <span className="font-light">France</span>
                  </div>
                  <div className="text-gray-300 ml-6 font-light">+33 6 44 64 57 17</div>
                </div>
                
                <div className="mt-4">
                  <div className="flex items-center text-gray-300">
                    <Mail className="h-4 w-4 mr-2" />
                    <span className="font-light">info@theflex.global</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-500 mt-12 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2025 The Flex. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* WhatsApp Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Link href="https://wa.me/447723745646" target="_blank" rel="noopener noreferrer">
          <div className="bg-[#25D366] rounded-full p-4 shadow-lg hover:bg-[#22C55E] transition-colors cursor-pointer">
            <MessageCircle className="h-6 w-6 text-white" />
          </div>
        </Link>
      </div>
    </>
  );
}
