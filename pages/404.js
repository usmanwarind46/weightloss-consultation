import React from 'react';
import Link from 'next/link';
import { MdErrorOutline } from 'react-icons/md';

const Error = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E9F6FA] px-4">
      <div className="text-center max-w-md">
        <div className="text-primary mb-4">
          <MdErrorOutline className="mx-auto text-6xl text-primary" />
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Page Not Found</h1>
        <p className="text-gray-600 mb-6">
          Sorry, we couldn't find the page you're looking for. Please return to the consultation flow.
        </p>
        <Link href="/">
          <button className="px-6 py-3 bg-primary text-white rounded-md font-medium hover:bg-[#3550a0] transition">
            Go to Homepage
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Error;
