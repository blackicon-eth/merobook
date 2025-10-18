import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Loader2 } from 'lucide-react';
import { getEnsName } from '@/lib/ens';
import { copyToClipboard, formatWalletAddress } from '@/lib/utils';
import { isAddress } from 'viem';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/shadcn-ui/tooltip';

interface AddressBannerProps {
  address: string | null;
}

export function AddressBanner({ address }: AddressBannerProps) {
  const [ensName, setEnsName] = useState<string | null>(null);
  const [isFetchingName, setIsFetchingName] = useState<boolean>(false);

  // When the user connects their wallet, set the username
  useEffect(() => {
    // Fetch the username and avatar
    const fetchEnsName = async () => {
      // If there is no address, reset the username
      if (!address || !isAddress(address)) {
        setEnsName(null);
        return;
      }
      setIsFetchingName(true);
      const ensName = await getEnsName(address);
      setEnsName(ensName || formatWalletAddress(address));
      setIsFetchingName(false);
    };
    fetchEnsName();
  }, [address]);

  if (!address) return null;

  const handleCopy = () => {
    copyToClipboard(
      address,
      'Address copied to clipboard',
      'Failed to copy address',
    );
  };

  return (
    <TooltipProvider>
      <Tooltip delayDuration={0.1}>
        <TooltipTrigger asChild>
          <motion.button
            disabled={isFetchingName}
            onClick={handleCopy}
            whileHover={{ scale: isFetchingName ? 1 : 1.01 }}
            whileTap={{ scale: isFetchingName ? 1 : 0.99 }}
            className="flex min-w-[160px] h-[33px] justify-center items-center gap-2 px-2.5 py-1 mt-1.5 rounded-md bg-muted/30 border border-border text-sm cursor-pointer"
          >
            <AnimatePresence mode="wait">
              {isFetchingName ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Loader2 className="size-4 animate-spin text-primary" />
                </motion.div>
              ) : ensName ? (
                <motion.div
                  key="ens-name"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <span className="text-muted-foreground">💰</span>
                  <span className="font-mono text-foreground mt-1">
                    {ensName}
                  </span>
                </motion.div>
              ) : address ? (
                <motion.button
                  key="wallet-address"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <span className="text-muted-foreground">💰</span>
                  <span className="font-mono text-foreground mt-1">
                    {formatWalletAddress(address)}
                  </span>
                </motion.button>
              ) : null}
            </AnimatePresence>
          </motion.button>
        </TooltipTrigger>
        <TooltipContent className="mb-2">
          <p className="font-mono text-xs">{address}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
