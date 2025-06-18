import React from 'react';
import { ShieldCheck, Cpu, LayoutDashboard, TrendingUp } from 'lucide-react';

const features = [
  {
    title: 'Real-time Data Processing',
    icon: <Cpu className="w-8 h-8 text-purple-600 mb-3" />,
    description: 'Handle live data streams with low latency and high efficiency.'
  },
  {
    title: 'User-Friendly Interface',
    icon: <LayoutDashboard className="w-8 h-8 text-purple-600 mb-3" />,
    description: 'An intuitive and clean UI for seamless user experience.'
  },
  {
    title: 'Scalable Architecture',
    icon: <TrendingUp className="w-8 h-8 text-purple-600 mb-3" />,
    description: 'Built to help with your emotional and mental health needs, scaling effortlessly with your requirements.'
  },
  {
    title: 'Secure and Reliable',
    icon: <ShieldCheck className="w-8 h-8 text-purple-600 mb-3" />,
    description: 'Absolute anonmimity and data protection, ensuring your conversations are private and secure. Nothing is stored, nothing is shared.'
  }
];

const Features = () => {
  return (
    <div className="bg-white py-16 px-4 sm:px-6 lg:px-8 text-slate-800">
      <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto mb-30">
        {features.map((feature, index) => (
          <div
            key={index}
            className="flex flex-col items-center bg-slate-50 p-6 rounded-2xl shadow-md hover:shadow-lg transition-all"
          >
            {feature.icon}
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-sm text-center text-slate-600">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Features;