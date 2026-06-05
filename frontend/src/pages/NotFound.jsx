import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <>
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="blob bg-red-200 w-[40rem] h-[40rem] top-[20%] left-[20%]" style={{ animationDelay: '0s', animationDuration: '20s' }}></div>
      </div>

      <div className="flex flex-col items-center justify-center min-h-[70vh] animate-fade-in text-center px-4">
        <div className="bg-white/40 backdrop-blur-xl p-12 rounded-3xl border border-gray-100 shadow-xl max-w-2xl w-full">
          <div className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500 mb-4 drop-shadow-sm">
            404
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800 mb-4">Page Not Found</h2>
          <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto">
            Oops! The page you're looking for doesn't exist or has been moved. Let's get you back on track.
          </p>
          <Link to="/" className="btn btn-primary shadow-lg inline-flex items-center gap-2 px-8 py-3 text-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Return Home
          </Link>
        </div>
      </div>
    </>
  );
};

export default NotFound;
