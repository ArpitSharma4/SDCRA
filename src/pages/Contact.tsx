import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Radio, Send, CheckCircle, AlertTriangle, Shield, Lock, Satellite } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FormData {
  name: string;
  email: string;
  message: string;
}

interface FormStatus {
  type: 'idle' | 'sending' | 'success' | 'error';
  message: string;
}

export default function Contact() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: ''
  });
  const [formStatus, setFormStatus] = useState<FormStatus>({
    type: 'idle',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setFormStatus({
        type: 'error',
        message: 'All fields are required for transmission'
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setFormStatus({
        type: 'error',
        message: 'Invalid secure frequency format'
      });
      return;
    }

    setFormStatus({
      type: 'sending',
      message: 'Transmitting'
    });

    try {
      const response = await fetch('http://localhost:3001/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setFormStatus({
          type: 'success',
          message: 'Transmission successful. Awaiting confirmation.'
        });
        // Clear form after successful submission
        setFormData({ name: '', email: '', message: '' });
      } else {
        setFormStatus({
          type: 'error',
          message: data.error || 'Transmission failed. Retry required.'
        });
      }
    } catch (error) {
      setFormStatus({
        type: 'error',
        message: 'Server connection lost. Retry transmission.'
      });
      console.error('Contact form error:', error);
    }
  };

  const getStatusIcon = () => {
    switch (formStatus.type) {
      case 'sending':
        return <Radio className="w-4 h-4 animate-pulse" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default:
        return <Send className="w-4 h-4" />;
    }
  };

  const getStatusColor = () => {
    switch (formStatus.type) {
      case 'sending':
        return 'text-cyan-400';
      case 'success':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-cyan-400';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-emerald-500/95 font-mono pt-20">
      <div className="container mx-auto px-4 py-4">
        {/* Header - Removed for cleaner layout */}

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl mx-auto"
        >
          <Card className="border-emerald-500/20 bg-slate-900/50 backdrop-blur-sm">
            <CardHeader className="border-b border-emerald-500/20">
              <CardTitle className="flex items-center gap-3 text-emerald-400">
                <Satellite className="w-5 h-5" />
                TRANSMISSION PROTOCOL
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-emerald-400 text-sm font-medium">
                    Agent ID
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your Name"
                    className="bg-slate-800/50 border-emerald-500/30 text-emerald-400 placeholder-emerald-500/40 focus:border-emerald-500/60 focus:bg-slate-800/70"
                    disabled={formStatus.type === 'sending'}
                  />
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-emerald-400 text-sm font-medium">
                    Secure Frequency
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    className="bg-slate-800/50 border-emerald-500/30 text-emerald-400 placeholder-emerald-500/40 focus:border-emerald-500/60 focus:bg-slate-800/70"
                    disabled={formStatus.type === 'sending'}
                  />
                </div>

                {/* Message Field */}
                <div className="space-y-2">
                  <Label htmlFor="message" className="text-emerald-400 text-sm font-medium">
                    Intel Transmission
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Enter your encrypted message..."
                    rows={3}
                    className="bg-slate-800/50 border-emerald-500/30 text-emerald-400 placeholder-emerald-500/40 focus:border-emerald-500/60 focus:bg-slate-800/70 resize-none"
                    disabled={formStatus.type === 'sending'}
                  />
                </div>

                {/* Status Display */}
                {formStatus.message && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex items-center gap-2 text-sm ${getStatusColor()}`}
                  >
                    {getStatusIcon()}
                    <span className="font-mono">
                      {formStatus.message}
                      {formStatus.type === 'sending' && (
                        <span className="inline-block w-2 h-4 bg-current ml-1 animate-pulse" />
                      )}
                    </span>
                  </motion.div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={formStatus.type === 'sending'}
                  className="w-full bg-emerald-500/20 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/30 hover:border-emerald-500/60 font-semibold"
                >
                  <div className="flex items-center gap-2">
                    {getStatusIcon()}
                    {formStatus.type === 'sending' ? 'TRANSMITTING...' : 'SEND TRANSMISSION'}
                  </div>
                </Button>
              </form>

              {/* Security Notice */}
              <div className="mt-4 p-3 bg-slate-800/30 border border-emerald-500/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <Lock className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-emerald-500/60">
                    <p className="font-semibold text-emerald-400 mb-1">SECURITY NOTICE</p>
                    <p>All transmissions are encrypted end-to-end. This communication channel is monitored for unauthorized access attempts.</p>
                    <p className="mt-2">Transmission logs are retained for 30 days in accordance with SDCRA protocol.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Additional Info - Hidden for compact view */}
        {/* <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="max-w-2xl mx-auto mt-8 text-center"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/30 border border-emerald-500/20 rounded-lg p-4">
              <Radio className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
              <p className="text-xs text-emerald-500/60">Real-time Transmission</p>
            </div>
            <div className="bg-slate-900/30 border border-emerald-500/20 rounded-lg p-4">
              <Shield className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
              <p className="text-xs text-emerald-500/60">Military-grade Encryption</p>
            </div>
            <div className="bg-slate-900/30 border border-emerald-500/20 rounded-lg p-4">
              <CheckCircle className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
              <p className="text-xs text-emerald-500/60">Delivery Confirmation</p>
            </div>
          </div>
        </motion.div> */}
      </div>
    </div>
  );
}
