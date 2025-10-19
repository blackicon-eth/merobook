'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../shadcn-ui/dialog';
import { ExternalLink } from 'lucide-react';
import type { Tip } from '@/api/AbiClient';
import { formatTimestamp } from '@/lib/utils';

interface TipsListModalProps {
  trigger: React.ReactNode;
  tips: Tip[];
  totalAmount: number;
}

export function TipsListModal({
  trigger,
  tips,
  totalAmount,
}: TipsListModalProps) {
  const [open, setOpen] = useState<boolean>(false);

  // Function to shorten transaction hash
  const shortenTxHash = (hash: string) => {
    if (!hash) return '';
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  };

  // Function to get Base Sepolia block explorer link
  const getExplorerLink = (txHash: string) => {
    return `https://basescan.org/tx/${txHash}`;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold glow-text flex items-center gap-2">
            Tips Received
          </DialogTitle>
          <DialogDescription className="text-white/60">
            Total tips:{' '}
            <span className="text-primary font-semibold">
              ${totalAmount.toFixed(2)} USDC
            </span>
          </DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="mt-4"
        >
          {tips.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No tips yet</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {tips.map((tip, index) => (
                <motion.div
                  key={`${tip.user_id}-${tip.timestamp}-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-card/50 border border-border hover:border-primary/50 transition-colors"
                >
                  {/* User Avatar */}
                  <div className="size-12 rounded-full overflow-hidden bg-secondary border border-primary/20 shrink-0">
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(tip.user_name)}`}
                      alt={tip.user_name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* User Info and Amount */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xl font-semibold text-foreground truncate">
                        {tip.user_name}
                      </p>
                      <span className="text-primary font-bold text-lg shrink-0">
                        ${tip.amount_usdc}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm text-muted-foreground">
                        {formatTimestamp(tip.timestamp)}
                      </p>
                      {tip.tx_hash && (
                        <>
                          <span className="text-muted-foreground">•</span>
                          <a
                            href={getExplorerLink(tip.tx_hash)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className="font-mono text-sm">
                              {shortenTxHash(tip.tx_hash)}
                            </span>
                            <ExternalLink className="size-3 mb-1.5" />
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
