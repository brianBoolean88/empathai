
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-10">
      <div className="container mx-auto text-center">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Brian Wang. All rights reserved.
        </p>
        <p className="text-xs mt-2">
          Visit my {' '}
          <a href="https://brianportfoliowebsite.vercel.app/" className="text-purple-400 hover:underline">
            Portfolio Website
          </a>{' '}
          and{' '}
          <a href="https://github.com/brianBoolean88" className="text-purple-400 hover:underline">
            GitHub
          </a>
        </p>
        <p className="text-xs mt-2">
          Made with ❤️ using Next.js, Tailwind CSS, and HuggingFace.
        </p>
        <p className="text-xs mt-2">
          This project is open source. Check it out on{' '}
          <a href=""
            className="text-purple-400 hover:underline"
          >HuggingFace</a>.
        </p>
      </div>
    </footer>
  );
}

export default Footer;