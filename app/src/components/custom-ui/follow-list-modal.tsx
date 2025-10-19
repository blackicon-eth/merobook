'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../shadcn-ui/dialog';
import { Loader2 } from 'lucide-react';
import type { User } from '@/api/AbiClient';
import { useGeneralContext } from '@/contexts/general-context';
import { Link } from 'react-router-dom';

interface FollowListModalProps {
  trigger: React.ReactNode;
  userIds: string[];
  title: string;
  description: string;
}

export function FollowListModal({
  trigger,
  userIds,
  title,
  description,
}: FollowListModalProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { api, currentUser } = useGeneralContext();

  // Fetch user details when modal opens
  useEffect(() => {
    const fetchUsers = async () => {
      if (!open || !api || userIds.length === 0) return;

      setIsLoading(true);
      try {
        const userPromises = userIds.map((userId) =>
          api.getUser({ id: userId }).catch(() => null),
        );
        const fetchedUsers = await Promise.all(userPromises);
        setUsers(fetchedUsers.filter((user): user is User => user !== null));
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [open, api, userIds]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold glow-text">
            {title}
          </DialogTitle>
          <DialogDescription className="text-white/60">
            {description}
          </DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="mt-4"
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-6 animate-spin text-primary" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No users to display</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {users.map((user, index) => {
                const isOwnProfile = currentUser?.id === user.id;
                const profileUrl = isOwnProfile
                  ? '/profile'
                  : `/user/${user.id}`;

                return (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to={profileUrl}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 p-3 rounded-lg bg-card/50 border border-border hover:border-primary/50 transition-colors cursor-pointer"
                    >
                      {/* User Avatar */}
                      <div className="size-12 rounded-full overflow-hidden bg-secondary border border-primary/20 shrink-0">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xl font-semibold text-foreground truncate">
                          {user.name}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {user.bio}
                        </p>
                      </div>

                      {/* User ID Badge */}
                      <div className="px-2 py-1 rounded-md bg-muted/30 border border-border shrink-0">
                        <p className="text-xs font-mono text-muted-foreground">
                          #{user.id}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
