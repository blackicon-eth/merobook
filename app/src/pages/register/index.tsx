import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button } from '@/components/shadcn-ui/button';
import { Card } from '@/components/shadcn-ui/card';
import { useGeneralContext } from '@/contexts/general-context';
import { useCalimero } from '@calimero-network/calimero-client';
import { createKvClient } from '@/features/kv/api';
import { toast } from 'sonner';
import { UserCircle, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { currentUser, currentPublicKey, isLoadingUser, refreshUser } =
    useGeneralContext();
  const { app } = useCalimero();

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  // Redirect if already registered
  useEffect(() => {
    if (!isLoadingUser && currentUser) {
      navigate('/home');
    }
  }, [currentUser, isLoadingUser, navigate]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (!app || !currentPublicKey) {
      toast.error('Authentication error. Please login again.');
      return;
    }

    setIsRegistering(true);
    try {
      const api = await createKvClient(app);

      // Generate avatar using DiceBear API
      const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;

      await api.createUser({
        name: name.trim(),
        avatar,
        bio: bio.trim() || 'New to Merobook!',
        public_key: currentPublicKey,
      });

      toast.success('Registration successful! Welcome to Merobook! 🎉');

      // Refresh user data
      await refreshUser();

      // Navigate to home
      navigate('/home');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to register',
      );
    } finally {
      setIsRegistering(false);
    }
  };

  if (isLoadingUser) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-xl text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="p-8 bg-card/50 backdrop-blur border-border">
          <div className="flex flex-col items-center gap-6">
            {/* Icon */}
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl" />
              <div className="relative size-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <UserCircle className="size-12 text-white" />
              </div>
            </div>

            {/* Title */}
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-foreground">
                Welcome to Merobook!
              </h1>
              <p className="text-muted-foreground">
                Create your profile to get started
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleRegister} className="w-full space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="text-sm font-medium text-foreground"
                >
                  Display Name *
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={isRegistering}
                  maxLength={50}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="bio"
                  className="text-sm font-medium text-foreground"
                >
                  Bio
                </label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself (optional)"
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  disabled={isRegistering}
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground">
                  {bio.length}/200 characters
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isRegistering || !name.trim()}
              >
                {isRegistering ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Creating Profile...
                  </>
                ) : (
                  'Create Profile'
                )}
              </Button>
            </form>

            {/* Public Key Info */}
            {currentPublicKey && (
              <div className="w-full p-3 rounded-lg bg-muted/50 border border-border">
                <p className="text-xs text-muted-foreground mb-1">
                  Your Public Key:
                </p>
                <p className="text-xs font-mono text-foreground break-all">
                  {currentPublicKey}
                </p>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
