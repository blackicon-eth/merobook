'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Heart, DollarSign } from 'lucide-react';
import { Card } from '../shadcn-ui/card';
import { Button } from '../shadcn-ui/button';
import { Post } from '@/api/AbiClient';

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
}

export function PostCard({ post, onLike }: PostCardProps) {
  const handleTip = () => {
    alert(`Tipping ${post.author_name}! (Feature coming soon)`);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

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
              {formatDate(post.timestamp)}
            </p>
          </div>

          <p className="text-foreground leading-relaxed">{post.content}</p>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => onLike(post.id)}
                variant="secondary"
                className="flex items-center gap-2"
              >
                <Heart className="size-4" />
                <span>{post.likes}</span>
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleTip}
                variant="secondary"
                className="flex items-center gap-2 ml-auto"
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
