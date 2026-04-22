import React from 'react';
import { Layers, Mail, MessageCircle, Share2 } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-secondary py-12">
      <div className="container grid md:grid-cols-4 gap-8">
        <div className="md:col-span-1">
          <div className="flex items-center gap-3 text-xl font-bold text-text mb-4">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-white">
              <Layers size={18} />
            </div>
            <span>Ecera System</span>
          </div>
          <p className="text-text-muted mb-6">
            Empowering learners worldwide with high-quality courses and expert instruction.
          </p>
          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all">
              <MessageCircle size={20} />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all">
              <Share2 size={20} />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all">
              <Mail size={20} />
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-lg font-bold mb-4">Platform</h4>
          <ul className="flex flex-col gap-2 text-text-muted">
            <li><a href="#" className="hover:text-primary">All Courses</a></li>
            <li><a href="#" className="hover:text-primary">Instructors</a></li>
            <li><a href="#" className="hover:text-primary">Pricing</a></li>
            <li><a href="#" className="hover:text-primary">Student Dashboard</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-bold mb-4">Company</h4>
          <ul className="flex flex-col gap-2 text-text-muted">
            <li><a href="#" className="hover:text-primary">About Us</a></li>
            <li><a href="#" className="hover:text-primary">Careers</a></li>
            <li><a href="#" className="hover:text-primary">Contact</a></li>
            <li><a href="#" className="hover:text-primary">Privacy Policy</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-bold mb-4">Newsletter</h4>
          <p className="text-text-muted mb-4">Get the latest course updates and offers.</p>
          <div className="flex gap-2">
            <input 
              type="email" 
              placeholder="Email address" 
              className="w-full px-4 py-2 rounded-xl border border-secondary focus:outline-none focus:border-primary"
            />
            <button className="btn btn-primary py-2 px-4">Join</button>
          </div>
        </div>
      </div>
      <div className="container mt-12 pt-8 border-t border-secondary text-center text-text-muted text-sm">
        <p>&copy; {new Date().getFullYear()} Ecera System. All rights reserved.</p>
      </div>
      
    </footer>
  );
};

export default Footer;
