'use client';

import React, { useCallback, useState } from 'react';
import { motion } from 'motion/react';
import { Heart, DollarSign } from 'lucide-react';
import { Card } from '../shadcn-ui/card';
import { Button } from '../shadcn-ui/button';
import { Post } from '@/api/AbiClient';
import { formatTimestamp } from '@/lib/utils';
import { toast } from 'sonner';
import { useGeneralContext } from '@/contexts/general-context';

interface PostCardProps {
  post: Post;
  getPosts: () => Promise<void>;
}

export function PostCard({ post, getPosts }: PostCardProps) {
  const { currentUser, api } = useGeneralContext();
  const [isLiking, setIsLiking] = useState(false);

  const handleTip = () => {
    toast.info('Tipping feature coming soon');
  };

  // Check if current user has liked this post
  const hasUserLiked = currentUser
    ? post.likes.some((like) => like.user_id === currentUser.id)
    : false;

  // Get names of users who liked this post
  const likeNames = post.likes.map((like) => like.user_name).join(', ');

  // Handles the liking/unliking of a post
  const handleLike = useCallback(
    async (postId: string) => {
      if (!api || isLiking || !currentUser) {
        if (!currentUser) {
          toast.error('Please register your user first');
        }
        return;
      }
      setIsLiking(true);
      try {
        if (hasUserLiked) {
          await api.unlikePost({ post_id: postId, user_id: currentUser.id });
        } else {
          await api.likePost({ post_id: postId, user_id: currentUser.id });
        }
        await getPosts();
      } catch (error) {
        console.error('like/unlike error:', error);
        toast.error('Failed to update like');
      } finally {
        setIsLiking(false);
      }
    },
    [api, getPosts, currentUser, hasUserLiked, isLiking],
  );

  return (
    <Card className="p-6 bg-card/50 backdrop-blur border-border glow-border">
      <div className="flex gap-4">
        {/* Avatar */}
        <div className="size-12 rounded-full overflow-hidden bg-secondary border border-primary shrink-0">
          <img
            src={post.author_avatar || '/placeholder.svg'}
            alt={post.author_name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="flex-1 space-y-3">
          <div>
            <h3 className="font-semibold text-lg text-foreground">
              {post.author_name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {formatTimestamp(post.timestamp)}
            </p>
          </div>

          <p className="text-foreground leading-relaxed">{post.content}</p>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title={likeNames || 'No likes yet'}
            >
              <Button
                onClick={() => handleLike(post.id)}
                variant={hasUserLiked ? 'default' : 'secondary'}
                className="flex items-center gap-2 w-[54px] shrink-0"
                disabled={isLiking}
              >
                <Heart
                  className={`size-4 ${hasUserLiked ? 'text-[#00d080] fill-current' : ''}`}
                />
                <span>{post.likes.length}</span>
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleTip}
                variant="secondary"
                className="flex items-center gap-2 ml-auto w-[70px] shrink-0"
              >
                <DollarSign className="size-4" />
                <span>Tip</span>
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </Card>
  );
}
