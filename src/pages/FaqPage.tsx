import { motion } from 'framer-motion';
import { Database, Activity, ShieldAlert, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

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
      className="border border-emerald-900/25 rounded-lg overflow-hidden bg-slate-900/50 backdrop-blur-sm"
    >
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-800/50 transition-colors group"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-emerald-500 flex-shrink-0" />
          <span className="font-mono text-emerald-300 group-hover:text-emerald-200 transition-colors">
            &gt; QUERY: {item.question}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-emerald-500" />
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
        <div className="px-6 py-4 bg-slate-800/30 border-t border-emerald-900/20">
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
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-4xl mx-auto mb-6">
          <div className="text-[11px] uppercase tracking-[0.35em] text-slate-500 font-mono">
            Knowledge Base
          </div>
          <div className="mt-2 flex items-end justify-between gap-4">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-100">
              FAQs
            </h1>
            <div className="hidden sm:block text-[11px] text-emerald-400/80 font-mono">
              Status: Online
            </div>
          </div>
          <div className="mt-4 h-px w-full bg-gradient-to-r from-emerald-500/25 via-slate-700/40 to-transparent" />
        </div>

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
            className="btn-glass inline-flex items-center gap-2 px-6 py-3 font-mono text-slate-200"
          >
            <span>← RETURN TO HOME</span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
