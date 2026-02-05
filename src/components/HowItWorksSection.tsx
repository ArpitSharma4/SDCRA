import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Database, BarChart3, AlertCircle, Monitor, ArrowRight } from 'lucide-react';

const steps = [
  {
    icon: Database,
    title: 'Satellite Data',
    description: 'Collect orbital parameters from space catalogs',
    color: 'text-accent',
    bgColor: 'bg-accent/10',
    borderColor: 'border-accent/20',
  },
  {
    icon: BarChart3,
    title: 'Space Density',
    description: 'Calculate object density across orbital shells',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/20',
  },
  {
    icon: AlertCircle,
    title: 'Collision Risk',
    description: 'Estimate probability using flux models',
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    borderColor: 'border-warning/20',
  },
  {
    icon: Monitor,
    title: 'Visualization',
    description: 'Interactive 3D display and reporting',
    color: 'text-success',
    bgColor: 'bg-success/10',
    borderColor: 'border-success/20',
  },
];

export function HowItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden min-h-screen flex items-center" ref={ref}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="text-primary font-mono text-sm tracking-wider uppercase">
            Our Process
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-4 mb-6">
            How <span className="text-primary text-glow-subtle">SDCRA</span> Works
          </h2>
          <p className="text-muted-foreground text-lg">
            From raw orbital data to actionable collision risk analysis in four streamlined steps.
          </p>
        </motion.div>

        {/* Flow Diagram */}
        <div className="relative">
          {/* Connection Line - Desktop */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-accent via-primary to-success transform -translate-y-1/2 opacity-30" />
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="relative"
              >
                {/* Arrow between cards - Desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:flex absolute top-1/2 -right-5 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-6 h-6 text-muted-foreground/50" />
                  </div>
                )}
                
                <div className="h-full p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 group">
                  {/* Step Number */}
                  <div className="text-xs font-mono text-muted-foreground mb-4">
                    STEP {String(index + 1).padStart(2, '0')}
                  </div>
                  
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-xl ${step.bgColor} ${step.borderColor} border flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                    <step.icon className={`w-7 h-7 ${step.color}`} />
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-lg font-semibold mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Technical Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-muted-foreground font-mono">
            Powered by TLE data and NASA's MASTER/ORDEM debris models
          </p>
        </motion.div>
      </div>
    </section>
  );
}

export default HowItWorksSection;
