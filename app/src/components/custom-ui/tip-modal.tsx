'use client';

import React, { useCallback, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../shadcn-ui/dialog';
import { Button } from '../shadcn-ui/button';
import { toast } from 'sonner';
import { Loader2, DollarSign } from 'lucide-react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { erc20Abi, parseUnits } from 'viem';
import { Input } from '../shadcn-ui/input';
import { useConfetti } from '@/hooks/use-confetti';
import { useGeneralContext } from '@/contexts/general-context';
import { USDC_ADDRESS } from '@/lib/constants';

interface TipModalProps {
  trigger: React.ReactNode;
  postId: string;
  recipientAddress: string;
  recipientName: string;
  onTipSuccess?: () => Promise<void>;
}

export function TipModal({
  trigger,
  postId,
  recipientAddress,
  recipientName,
  onTipSuccess,
}: TipModalProps) {
  const [amount, setAmount] = useState<string>('');
  const [open, setOpen] = useState<boolean>(false);
  const { startConfetti } = useConfetti({ duration: 750 });
  const { currentUser, api } = useGeneralContext();

  const {
    data: hash,
    writeContract,
    isPending: isWritePending,
  } = useWriteContract();

  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  // Handle sending the tip
  const handleSendTip = useCallback(async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!recipientAddress) {
      toast.error('Invalid recipient address');
      return;
    }

    try {
      // Parse amount to USDC format (6 decimals)
      const amountInUsdc = parseUnits(amount, 6);

      // Call the USDC transfer function
      writeContract(
        {
          address: USDC_ADDRESS,
          abi: erc20Abi,
          functionName: 'transfer',
          args: [recipientAddress as `0x${string}`, amountInUsdc],
        },
        {
          onSuccess: async (txHash) => {
            try {
              // Record the tip in the backend
              if (api && currentUser) {
                await api.recordTip({
                  post_id: postId,
                  user_id: currentUser.id,
                  amount_usdc: amount,
                  tx_hash: txHash,
                });
              }

              // Refresh posts if callback provided
              if (onTipSuccess) {
                await onTipSuccess();
              }

              toast.success(`Successfully tipped ${amount} USDC! 🎉`);
              startConfetti();
              setOpen(false);
              setTimeout(() => setAmount(''), 300);
            } catch (error) {
              console.error('Error recording tip:', error);
              toast.error('Tip sent, but failed to record on-chain');
            }
          },
          onError: () => {
            toast.error('Transaction failed');
          },
        },
      );
    } catch (error) {
      console.log('Send tip error:', error);
      toast.error('Transaction failed');
    }
  }, [
    amount,
    recipientAddress,
    writeContract,
    startConfetti,
    api,
    currentUser,
    postId,
    onTipSuccess,
  ]);

  const isLoading = isWritePending || isConfirming;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px] backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold glow-text">
            Send Tip
          </DialogTitle>
          <DialogDescription className="text-white/60">
            Tip {recipientName} with USDC
          </DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="space-y-4 py-4"
        >
          {/* Recipient Info */}
          <div className="p-3 rounded-lg bg-muted/30 border border-border">
            <p className="text-xs text-muted-foreground mb-1">Sending to:</p>
            <p className="text-sm font-semibold text-foreground">
              {recipientName}
            </p>
            <p className="text-xs font-mono text-muted-foreground break-all">
              {recipientAddress}
            </p>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <label
              htmlFor="amount"
              className="text-sm font-medium text-white flex items-center gap-2"
            >
              <DollarSign className="size-4" />
              Amount (USDC)
            </label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:border-[oklch(0.75_0.15_166)]/50 focus:ring-[oklch(0.75_0.15_166)]/20"
              disabled={isLoading}
            />
            <p className="text-xs text-white/40">
              Enter the amount of USDC you want to tip
            </p>
          </div>

          {/* Quick Amount Buttons */}
          <div className="flex gap-2">
            {['1', '5', '10', '20'].map((quickAmount) => (
              <Button
                key={quickAmount}
                variant="outline"
                size="sm"
                className="flex-1 border-white/10 bg-white/5 text-white hover:bg-white/10"
                onClick={() => setAmount(quickAmount)}
                disabled={isLoading}
              >
                ${quickAmount}
              </Button>
            ))}
          </div>
        </motion.div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            className="w-[80px] border-white/10 bg-white/5 text-white hover:bg-white/10"
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSendTip}
            disabled={isLoading || !amount || parseFloat(amount) <= 0}
            className="w-[80px] bg-gradient-to-r from-[oklch(0.75_0.15_166)] to-[oklch(0.75_0.15_186)] text-black font-semibold hover:opacity-90 transition-opacity glow-border"
          >
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Loader2 className="size-4 animate-spin" />
                </motion.div>
              ) : (
                <motion.div
                  key="send"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  Send
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
