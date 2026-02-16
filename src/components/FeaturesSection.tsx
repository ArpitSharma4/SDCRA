import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { 
  Target, 
  Map, 
  Network, 
  Orbit,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: Target,
    title: 'Orbit Risk Checker',
    description: 'Calculate collision probability for any satellite based on its orbital parameters. Get instant risk assessments with confidence intervals.',
    status: 'Live',
    statusColor: 'bg-success',
    action: 'Check Risk',
  },
  {
    icon: Map,
    title: 'Space Debris Heatmap',
    description: 'Visualize debris density across different altitudes and inclinations. Identify the most congested orbital regions in real-time.',
    status: 'Live',
    statusColor: 'bg-success',
    action: 'View Heatmap',
  },
  {
    icon: Network,
    title: 'Constellation Analysis',
    description: 'Analyze collision risks for satellite mega-constellations. Model interactions between Starlink, OneWeb, and other networks.',
    status: 'Beta',
    statusColor: 'bg-warning',
    action: 'Analyze',
  },
  {
    icon: Orbit,
    title: 'Deorbit Visualization',
    description: 'Track debris reentry predictions and decay timelines. Understand how long objects will remain in orbit before natural deorbit.',
    status: 'Coming Soon',
    statusColor: 'bg-muted-foreground',
    action: 'Preview',
  },
];

export function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="features" className="py-24 relative overflow-hidden min-h-screen flex items-center" ref={ref}>
      {/* Background Elements */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2" />
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">
              Powerful Features
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Complete Orbital{' '}
            <span className="text-primary text-glow-subtle">Intelligence</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Advanced tools for space situational awareness, from individual satellite 
            analysis to constellation-wide risk assessment.
          </p>
        </motion.div>

        {/* Feature Cards Grid */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative"
            >
              <div className="h-full p-6 lg:p-8 rounded-2xl bg-card border border-border hover:border-primary/40 transition-all duration-500 overflow-hidden">
                {/* Hover Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                      <feature.icon className="w-7 h-7 text-primary" />
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${feature.statusColor}/10`}>
                      <span className={`w-2 h-2 rounded-full ${feature.statusColor}`} />
                      <span className="text-xs font-medium text-muted-foreground">
                        {feature.status}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl lg:text-2xl font-semibold mb-3 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {feature.description}
                  </p>

                  {/* Action */}
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="group/btn hover:bg-slate-200/10 hover:text-white p-0 h-auto font-medium"
                  >
                    {feature.action}
                    <ArrowUpRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturesSection;
