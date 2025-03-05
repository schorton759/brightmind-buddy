
import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const AuthHeader = () => {
  return (
    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
        BrightMind Buddy
        <Sparkles className="h-6 w-6 text-accent animate-pulse-soft" />
      </h1>
      <p className="text-muted-foreground mt-2">
        Your personal AI life coach
      </p>
    </div>
  );
};

export default AuthHeader;
