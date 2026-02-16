import React from 'react';
import { FileText, Download, Eye, ArrowLeft, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const DocumentationPage = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden pt-24">
      {/* 1. Global Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />
      
      {/* 2. Standard Navbar Area */}
      <div className="relative z-10 border-b border-slate-800 bg-slate-950/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <FileText className="w-6 h-6 text-cyan-400" />
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tighter">
                <span className="text-cyan-500">ARCHIVES</span> // KESSLER PROTOCOL
              </h1>
              <p className="text-slate-400 text-sm mt-2 tracking-widest uppercase">
                SECURE REPOSITORY - ACCESS GRANTED
              </p>
            </div>
          </div>
          {/* Back Button */}
          <Link 
            to="/" 
            className="btn-glass flex items-center gap-2 px-6 py-3 text-slate-200 transition-all uppercase tracking-wider text-sm group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Return to Command
          </Link>
        </div>
      </div>
      
      {/* 3. Main Content Area */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-0 border border-slate-800 bg-slate-900/20 backdrop-blur-sm">
          
          {/* Left Side: Visual Icon */}
          <div className="p-12 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-800 bg-slate-900/40 relative overflow-hidden group">
            <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            <div className="relative w-24 h-24 mb-6 flex items-center justify-center rounded-full border border-cyan-500/30 bg-cyan-950/20 text-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
              <Shield className="w-10 h-10" />
            </div>
            
            <div className="text-center space-y-2">
              <div className="text-xs text-cyan-500 uppercase tracking-[0.3em]">File Status</div>
              <div className="text-xl font-bold text-white tracking-widest">DECLASSIFIED</div>
            </div>
          </div>
          
          {/* Right Side: Details & Actions */}
          <div className="p-12 flex flex-col justify-center space-y-8">
            
            <div>
              <h2 className="text-xl text-white font-bold mb-2 flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-500" />
                TECHNICAL_BRIEF_V1.PDF
              </h2>
              <div className="h-px w-full bg-gradient-to-r from-cyan-500/50 to-transparent mb-4" />
              <p className="text-slate-400 leading-relaxed text-sm">
                Complete technical reference manual regarding orbital decay algorithms, collision risk assessment methodologies, and the SDCRA system architecture.
              </p>
            </div>
            
            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs uppercase tracking-wider text-slate-500 border-t border-b border-slate-800 py-4">
              <div>
                <span className="block text-slate-600">File Size</span>
                <span className="text-cyan-400">2.4 MB</span>
              </div>
              <div>
                <span className="block text-slate-600">Last Update</span>
                <span className="text-cyan-400">2026-02-11</span>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <a 
                href="/docs/KESSLER_DOCUMENTATION.pdf" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-glass flex-1 flex items-center justify-center gap-2 px-6 py-4 text-slate-200 transition-all group uppercase tracking-wider text-sm"
              >
                <Eye className="w-4 h-4" />
                Visual Scan
              </a>
              <a 
                href="/docs/KESSLER_DOCUMENTATION.pdf" 
                download="SDCRA_Protocol_Manual.pdf"
                className="btn-glass flex-1 flex items-center justify-center gap-2 px-6 py-4 text-slate-200 transition-all group uppercase tracking-wider text-sm"
              >
                <Download className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
                Extract Data
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentationPage;
