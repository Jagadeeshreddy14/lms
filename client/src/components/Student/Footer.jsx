import { Link } from 'react-router-dom';
import { FiFacebook, FiInstagram, FiTwitter, FiSend } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-[#001f3f] to-black text-white pt-4 pb-3 relative overflow-hidden text-sm flex-shrink-0 border-t border-[#0a1128]">
      {/* Starry background */}
      <div className="absolute inset-0 starry-bg opacity-10 pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Two column layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
          {/* Logo and slogan */}
          <div className="flex flex-col items-center sm:items-start">
            <div className="font-bold text-lg mb-1">Course<span className="text-[#0074D9]">Connect</span></div>
            <p className="text-[#94a3b8] text-xs mb-2">Empowering learners worldwide with quality education</p>
          </div>

          {/* Newsletter */}
          <div className="flex flex-col items-center sm:items-end">
            <h4 className="font-medium text-sm mb-1">Join our community</h4>
            <p className="text-[#94a3b8] text-xs mb-2 text-center sm:text-right">Get updates on new courses and exclusive offers</p>
            <div className="flex w-full max-w-xs">
              <input
                type="email"
                placeholder="Your email"
                className="bg-[#001f3f] border-y border-l border-[#334155] text-white px-3 py-1.5 text-xs rounded-l-md w-full focus:outline-none focus:border-[#0074D9] transition-colors"
              />
              <button className="flex items-center justify-center px-3 py-1.5 bg-[#0074D9] hover:bg-[#005bb5] transition rounded-r-md">
                <FiSend size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center text-[#94a3b8] text-xs pt-1">
          <p>© {new Date().getFullYear()} CourseConnect Education Platform</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;