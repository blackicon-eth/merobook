'use client';

import React, { useCallback, useState } from 'react';
import { motion } from 'motion/react';
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
import { AbiClient } from '@/api/AbiClient';
import { toast } from 'sonner';

interface CreatePostModalProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  api: AbiClient | null;
  getPosts: () => Promise<void>;
}

export function CreatePostModal({
  trigger,
  open,
  onOpenChange,
  api,
  getPosts,
}: CreatePostModalProps) {
  const [author, setAuthor] = useState<string>('');
  const [content, setContent] = useState<string>('');

  // Handles the creation of a new post
  const createPost = useCallback(async () => {
    if (!api || !author.trim() || !content.trim()) {
      toast.error('Please enter both author and content');
      return;
    }
    try {
      await api.createPost({
        author_id: author.trim(),
        content: content.trim(),
      });
      await getPosts();
      toast.success('Post created successfully!');
      setAuthor('');
      setContent('');
    } catch (error) {
      console.error('createPost error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to create post',
      );
    }
  }, [api, author, content, getPosts]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[600px] border-white/10 bg-black/90 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold glow-text">
            Create Post
          </DialogTitle>
          <DialogDescription className="text-white/60">
            Share your thoughts with the community
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
            <Avatar className="h-10 w-10 border-2 border-[oklch(0.75_0.15_166)]/30">
              <AvatarImage src="/placeholder.svg?height=40&width=40" />
              <AvatarFallback className="bg-[oklch(0.75_0.15_166)]/20 text-[oklch(0.75_0.15_166)]">
                YO
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-white">Your Name</p>
              <p className="text-xs text-white/50">@yourhandle</p>
            </div>
          </div>

          {/* Post Content */}
          <div className="space-y-2">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="min-h-[200px] resize-none border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:border-[oklch(0.75_0.15_166)]/50 focus:ring-[oklch(0.75_0.15_166)]/20"
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
            className="border-white/10 bg-white/5 text-white hover:bg-white/10"
            onClick={() => onOpenChange?.(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={createPost}
            disabled={!api || !author.trim() || !content.trim()}
            className="bg-gradient-to-r from-[oklch(0.75_0.15_166)] to-[oklch(0.75_0.15_186)] text-black font-semibold hover:opacity-90 transition-opacity glow-border"
          >
            Post
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
