import React from 'react';
import { motion } from 'motion/react';

export default function ProfilePage() {
  return (
    <div className="h-full py-8 px-6 overflow-y-scroll">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-2"> Your Feed</h1>
          <p className="text-muted-foreground">
            See what's happening in your neighborhood
          </p>
        </motion.div>
      </div>
    </div>
  );
}
