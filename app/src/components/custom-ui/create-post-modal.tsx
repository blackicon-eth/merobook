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
import { Textarea } from '../shadcn-ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../shadcn-ui/avatar';
import { toast } from 'sonner';
import { useGeneralContext } from '@/contexts/general-context';
import { Loader2 } from 'lucide-react';

interface CreatePostModalProps {
  trigger?: React.ReactNode;
  getPosts: () => Promise<void>;
}

export function CreatePostModal({ trigger, getPosts }: CreatePostModalProps) {
  const { currentUser, api } = useGeneralContext();
  const [content, setContent] = useState<string>('');
  const [open, setOpen] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  // Handles the creation of a new post
  const createPost = useCallback(async () => {
    if (!api || !currentUser || !content.trim()) {
      toast.error('Please enter both author and content');
      return;
    }
    try {
      setIsCreating(true);
      await api.createPost({
        author_id: currentUser.id,
        content: content.trim(),
      });
      await getPosts();
      toast.success('Post created successfully!');
      setOpen(false);
      setTimeout(() => {
        setContent('');
      }, 300);
    } catch (error) {
      console.error('createPost error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to create post',
      );
    } finally {
      setIsCreating(false);
    }
  }, [api, currentUser, content, getPosts]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[600px] backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold glow-text">
            Create Post
          </DialogTitle>
          <DialogDescription className="text-white/60">
            Share your thoughts with your community
          </DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="space-y-4 py-4"
        >
          {/* User Info */}
          <div className="flex items-center gap-3">
            <Avatar className="size-12 border-2 border-[oklch(0.75_0.15_166)]/30 shrink-0">
              <AvatarImage src={currentUser?.avatar || '/placeholder.svg'} />
              <AvatarFallback className="bg-[oklch(0.75_0.15_166)]/20 text-[oklch(0.75_0.15_166)]">
                {currentUser?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-medium text-white">
                {currentUser?.name || 'Your Name'}
              </p>
            </div>
          </div>

          {/* Post Content */}
          <div className="space-y-2">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="min-h-[180px] resize-none border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:border-[oklch(0.75_0.15_166)]/50 focus:ring-[oklch(0.75_0.15_166)]/20"
              maxLength={500}
            />
            <p className="text-xs text-white/40 text-right">
              {content.length}/{500}
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
            onClick={createPost}
            disabled={!api || !currentUser || !content.trim()}
            className="w-[80px] bg-gradient-to-r from-[oklch(0.75_0.15_166)] to-[oklch(0.75_0.15_186)] text-black font-semibold hover:opacity-90 transition-opacity glow-border"
          >
            <AnimatePresence mode="wait">
              {isCreating ? (
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
                  key="post"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  Post
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
