import { motion } from 'framer-motion';
import { Database, Activity, ShieldAlert, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { TypewriterTitle } from '@/components/TypewriterTitle';

interface FAQItem {
  question: string;
  answer: string;
  icon: React.ComponentType<any>;
}

const faqData: FAQItem[] = [
  {
    question: 'SOURCE_INTELLIGENCE: Where is data fetched from?',
    answer: 'Ingests live TLE data from CelesTrak and Space-Track.org.',
    icon: Database
  },
  {
    question: 'LATENCY: Is tracking real-time?',
    answer: 'Propagation is real-time (60fps), but TLE data updates every 4-12 hours via NORAD.',
    icon: Activity
  },
  {
    question: 'ACCURACY: Mission critical?',
    answer: 'Negative. Uses SGP4 models for visualization only. Not for collision avoidance maneuvers.',
    icon: ShieldAlert
  },
  {
    question: 'REENTRY WATCH: How is it predicted?',
    answer: 'Monitors Drag Coefficient and Mean Motion in VLEO (<200km altitude).',
    icon: Activity
  },
  {
    question: 'MANIFEST: What is a NORAD ID?',
    answer: 'A unique 5-digit identifier assigned by USSPACECOM (e.g., ISS is #25544).',
    icon: Database
  },
  {
    question: 'TECH STACK: How is this rendered?',
    answer: 'Three.js, React Fiber, and GPU acceleration for 15k+ objects.',
    icon: Activity
  }
];

const FAQAccordion = ({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) => {
  const Icon = item.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="border border-cyan-900/30 rounded-lg overflow-hidden bg-slate-900/50 backdrop-blur-sm"
    >
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-800/50 transition-colors group"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-cyan-500 flex-shrink-0" />
          <span className="font-mono text-cyan-400 group-hover:text-cyan-300 transition-colors">
            &gt; QUERY: {item.question}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-cyan-500" />
        </motion.div>
      </button>
      
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ 
          height: isOpen ? 'auto' : 0, 
          opacity: isOpen ? 1 : 0 
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="overflow-hidden"
      >
        <div className="px-6 py-4 bg-slate-800/30 border-t border-cyan-900/20">
          <p className="font-mono text-slate-300 text-sm leading-relaxed">
            {item.answer}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-cyan-500">
      {/* Header */}
      <div className="container mx-auto px-4 pt-32 pb-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <TypewriterTitle 
            lines={['SYSTEM PROTOCOLS // KNOWLEDGE BASE']}
            speed={50}
            className="text-4xl md:text-6xl font-bold text-cyan-400"
          />
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-600 to-cyan-400 mx-auto rounded-full mt-4"></div>
        </motion.div>

        {/* FAQ Items */}
        <div className="max-w-4xl mx-auto space-y-4">
          {faqData.map((item, index) => (
            <FAQAccordion
              key={index}
              item={item}
              isOpen={openIndex === index}
              onToggle={() => handleToggle(index)}
            />
          ))}
        </div>

        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-16"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 border border-cyan-900/50 rounded-lg font-mono text-cyan-400 hover:bg-slate-900/50 hover:border-cyan-500/50 transition-all"
          >
            <span>← RETURN TO HOME</span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
