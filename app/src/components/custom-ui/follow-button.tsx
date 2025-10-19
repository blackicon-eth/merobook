import React from 'react';
import { Button } from '../shadcn-ui/button';
import { Loader2 } from 'lucide-react';
import { UserMinus, UserPlus } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

interface FollowButtonProps {
  isFollowing: boolean;
  isTogglingFollow: boolean;
  handleToggleFollow: () => void;
}

export const FollowButton = ({
  isFollowing,
  isTogglingFollow,
  handleToggleFollow,
}: FollowButtonProps) => {
  return (
    <div className="absolute top-4 right-4">
      <Button
        onClick={handleToggleFollow}
        disabled={isTogglingFollow}
        variant={isFollowing ? 'secondary' : 'default'}
        size="sm"
        className="gap-2 h-9 w-24"
      >
        <AnimatePresence mode="wait">
          {isTogglingFollow ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2"
            >
              <Loader2 className="size-4 animate-spin" />
            </motion.div>
          ) : isFollowing ? (
            <motion.div
              key="unfollow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2"
            >
              <UserMinus className="size-4" />
              Unfollow
            </motion.div>
          ) : (
            <motion.div
              key="follow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2"
            >
              <UserPlus className="size-4" />
              Follow
            </motion.div>
          )}
        </AnimatePresence>
      </Button>
    </div>
  );
};
