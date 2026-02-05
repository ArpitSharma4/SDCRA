import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Globe, Layers, AlertTriangle, TrendingUp } from 'lucide-react';

const problems = [
  {
    icon: Globe,
    title: 'Crowded Low Earth Orbit',
    description: 'Over 34,000 objects larger than 10cm are currently tracked in orbit, creating an increasingly congested environment.',
  },
  {
    icon: Layers,
    title: 'Mega-Constellations',
    description: 'Companies are launching thousands of satellites, with plans for tens of thousands more, fundamentally changing orbital dynamics.',
  },
  {
    icon: TrendingUp,
    title: 'Exponential Growth',
    description: 'Space debris is growing exponentially. Each collision creates more fragments, potentially triggering a cascade effect.',
  },
  {
    icon: AlertTriangle,
    title: 'Increasing Collision Risk',
    description: 'The ISS performs collision avoidance maneuvers multiple times per year. Operational satellites face constant threat.',
  },
];

export function ProblemSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="problem" className="relative min-h-screen flex items-center bg-background" ref={ref}>
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
      
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="text-primary font-mono text-sm tracking-wider uppercase">
            The Challenge
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-4 mb-6">
            Space is Getting{' '}
            <span className="text-primary text-glow-subtle">Crowded</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            As humanity's presence in space expands, so does the risk. 
            Understanding orbital debris is crucial for the future of space exploration.
          </p>
        </motion.div>

        {/* Problem Cards */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {problems.map((problem, index) => (
            <motion.div
              key={problem.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative p-6 lg:p-8 rounded-2xl bg-gradient-card border border-border/50 hover:border-primary/30 transition-all duration-300"
            >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-primary/5" />
              
              <div className="relative flex gap-5">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:border-primary/40 transition-colors">
                    <problem.icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    {problem.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {problem.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Visual Stat */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 p-8 rounded-2xl glass border border-primary/20 text-center"
        >
          <div className="text-5xl sm:text-6xl lg:text-7xl font-bold text-primary font-mono mb-4 text-glow">
            7,500+ km/h
          </div>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Average collision velocity in LEO. At these speeds, even a paint fleck 
            can cause significant damage to operational spacecraft.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

export default ProblemSection;
