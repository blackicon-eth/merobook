'use client';

import React, { useCallback, useState, useEffect } from 'react';
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
import { Textarea } from '../shadcn-ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../shadcn-ui/avatar';
import { toast } from 'sonner';
import { useGeneralContext } from '@/contexts/general-context';
import { Loader2 } from 'lucide-react';

interface EditProfileModalProps {
  trigger?: React.ReactNode;
}

export function EditProfileModal({ trigger }: EditProfileModalProps) {
  const { currentUser, api, refreshUser } = useGeneralContext();
  const [name, setName] = useState<string>('');
  const [bio, setBio] = useState<string>('');
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [open, setOpen] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Initialize form with current user data
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setBio(currentUser.bio);
      setWalletAddress(currentUser.wallet_address || '');
    }
  }, [currentUser]);

  // Handles the update of user profile
  const updateProfile = useCallback(async () => {
    if (!api || !currentUser || !name.trim()) {
      toast.error('Please enter a name');
      return;
    }
    try {
      setIsUpdating(true);
      await api.updateUser({
        user_id: currentUser.id,
        name: name.trim(),
        bio: bio.trim(),
        wallet_address: walletAddress.trim() || null,
      });
      await refreshUser();
      toast.success('Profile updated successfully!');
      setOpen(false);
    } catch (error) {
      console.error('updateProfile error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to update profile',
      );
    } finally {
      setIsUpdating(false);
    }
  }, [api, currentUser, name, bio, walletAddress, refreshUser]);

  // Handle Enter key for input fields
  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        updateProfile();
      }
    },
    [updateProfile],
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[600px] backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold glow-text">
            Edit Profile
          </DialogTitle>
          <DialogDescription className="text-white/60">
            Update your profile information
          </DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="space-y-4 py-4"
        >
          {/* User Avatar */}
          <div className="flex items-center gap-3">
            <Avatar className="size-16 border-2 border-[oklch(0.75_0.15_166)]/30 shrink-0">
              <AvatarImage src={currentUser?.avatar || '/placeholder.svg'} />
              <AvatarFallback className="bg-[oklch(0.75_0.15_166)]/20 text-[oklch(0.75_0.15_166)]">
                {currentUser?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-white/60">Avatar</p>
              <p className="text-xs text-white/40">Avatar cannot be changed</p>
            </div>
          </div>

          {/* Name Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder="Your name"
              className="w-full px-4 py-2 rounded-md border border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:border-[oklch(0.75_0.15_166)]/50 focus:ring-[oklch(0.75_0.15_166)]/20 focus:outline-none"
              maxLength={50}
            />
            <p className="text-xs text-white/40 text-right">
              {name.length}/{50}
            </p>
          </div>

          {/* Bio Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Bio</label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder="Tell us about yourself"
              className="min-h-[120px] resize-none border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:border-[oklch(0.75_0.15_166)]/50 focus:ring-[oklch(0.75_0.15_166)]/20"
              maxLength={200}
            />
            <p className="text-xs text-white/40 text-right">
              {bio.length}/{200} • Press Ctrl+Enter to save
            </p>
          </div>

          {/* Wallet Address Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">
              Ethereum Wallet Address
            </label>
            <input
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder="0x... (optional, for receiving tips)"
              className="w-full px-4 py-2 rounded-md border border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:border-[oklch(0.75_0.15_166)]/50 focus:ring-[oklch(0.75_0.15_166)]/20 focus:outline-none"
            />
            <p className="text-xs text-white/40">
              Add your wallet to receive tips from other users • Press Enter to
              save
            </p>
          </div>
        </motion.div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            className="w-[80px] border-white/10 bg-white/5 text-white hover:bg-white/10"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={updateProfile}
            disabled={!api || !currentUser || !name.trim()}
            className="w-[80px] bg-gradient-to-r from-[oklch(0.75_0.15_166)] to-[oklch(0.75_0.15_186)] text-black font-semibold hover:opacity-90 transition-opacity glow-border"
          >
            <AnimatePresence mode="wait">
              {isUpdating ? (
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
                  key="save"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  Save
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
