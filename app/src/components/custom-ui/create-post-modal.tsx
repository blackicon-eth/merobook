'use client';

import React, { useCallback, useState, useRef } from 'react';
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
import { Loader2, Image as ImageIcon, X } from 'lucide-react';
import { uploadImage } from '@/lib/upload-image';

interface CreatePostModalProps {
  trigger?: React.ReactNode;
  getPosts: () => Promise<void>;
}

export function CreatePostModal({ trigger, getPosts }: CreatePostModalProps) {
  const { currentUser, api } = useGeneralContext();
  const [content, setContent] = useState<string>('');
  const [open, setOpen] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle image selection
  const handleImageSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast.error('Please select an image file');
          return;
        }
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error('Image size should be less than 5MB');
          return;
        }

        setSelectedImage(file);
        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    [],
  );

  // Remove selected image
  const handleRemoveImage = useCallback(() => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // Handles the creation of a new post
  const createPost = useCallback(async () => {
    if (!api || !currentUser || !content.trim()) {
      toast.error('Please enter some content');
      return;
    }
    try {
      setIsCreating(true);

      let imageUrl: string | null = null;

      // Upload image if selected
      if (selectedImage) {
        toast.info('Uploading image...');
        try {
          imageUrl = await uploadImage(selectedImage);
        } catch (error) {
          console.error('Image upload error:', error);
          toast.error(
            'Failed to upload image. Post will be created without it.',
          );
        }
      }

      await api.createPost({
        author_id: currentUser.id,
        content: content.trim(),
        image_url: imageUrl,
      });
      await getPosts();
      toast.success('Post created successfully!');
      setOpen(false);
      setTimeout(() => {
        setContent('');
        handleRemoveImage();
      }, 300);
    } catch (error) {
      console.error('createPost error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to create post',
      );
    } finally {
      setIsCreating(false);
    }
  }, [api, currentUser, content, selectedImage, getPosts, handleRemoveImage]);

  // Handle Enter key to submit (Ctrl+Enter for multi-line)
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        createPost();
      }
    },
    [createPost],
  );

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
              onKeyDown={handleKeyDown}
              placeholder="What's on your mind?"
              className="min-h-[180px] resize-none border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:border-[oklch(0.75_0.15_166)]/50 focus:ring-[oklch(0.75_0.15_166)]/20"
              maxLength={500}
            />
            <p className="text-xs text-white/40 text-right">
              {content.length}/{500}
            </p>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
              id="image-upload"
            />
            {!imagePreview ? (
              <label
                htmlFor="image-upload"
                className="flex items-center justify-center gap-2 py-3 px-4 border border-dashed border-white/20 rounded-lg cursor-pointer hover:border-primary/50 hover:bg-white/5 transition-colors"
              >
                <ImageIcon className="size-5 text-white/60" />
                <span className="text-sm text-white/60">
                  Add an image (optional)
                </span>
              </label>
            ) : (
              <div className="relative rounded-lg overflow-hidden border border-white/20">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full max-h-[300px] object-contain bg-black/20"
                />
                <button
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 size-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                  type="button"
                >
                  <X className="size-4" />
                </button>
              </div>
            )}
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
