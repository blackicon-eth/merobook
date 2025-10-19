'use client';

import React, { useCallback, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Heart, DollarSign, Trash2, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '../shadcn-ui/card';
import { Button } from '../shadcn-ui/button';
import { Post } from '@/api/AbiClient';
import { formatTimestamp } from '@/lib/utils';
import { toast } from 'sonner';
import { useGeneralContext } from '@/contexts/general-context';
import { useAccount } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { TipModal } from './tip-modal';
import { TipsListModal } from './tips-list-modal';
import { ImageModal } from './image-modal';

interface PostCardProps {
  post: Post;
  getPosts: () => Promise<void>;
}

export function PostCard({ post, getPosts }: PostCardProps) {
  const { currentUser, api } = useGeneralContext();
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { openConnectModal } = useConnectModal();
  const { address } = useAccount();

  // Handles the deletion of a post
  const handleDelete = useCallback(
    async (postId: string) => {
      if (!api || isDeleting || !currentUser) {
        return;
      }

      // Confirm deletion
      if (!window.confirm('Are you sure you want to delete this post?')) {
        return;
      }

      setIsDeleting(true);
      try {
        await api.deletePost({ post_id: postId, user_id: currentUser.id });
        toast.success('Post deleted successfully');
        await getPosts();
      } catch (error) {
        console.error('delete post error:', error);
        toast.error('Failed to delete post');
      } finally {
        setIsDeleting(false);
      }
    },
    [api, getPosts, currentUser, isDeleting],
  );

  // Check if current user has liked this post
  const hasUserLiked = currentUser
    ? post.likes.some((like) => like.user_id === currentUser.id)
    : false;

  // Check if this is the current user's own post
  const isOwnPost = currentUser?.id === post.author_id;

  // Get names of users who liked this post
  const likeNames = post.likes.map((like) => like.user_name).join(', ');

  // Calculate total tips amount
  const totalTips = post.tips.reduce(
    (sum, tip) => sum + parseFloat(tip.amount_usdc || '0'),
    0,
  );

  // Get names of users who tipped this post
  const tipNames = post.tips
    .map((tip) => `${tip.user_name} ($${tip.amount_usdc})`)
    .join(', ');

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
        <Link
          to={isOwnPost ? '/profile' : `/user/${post.author_id}`}
          className="size-12 rounded-full overflow-hidden bg-secondary border border-primary shrink-0 hover:border-primary/70 transition-colors"
        >
          <img
            src={post.author_avatar || '/placeholder.svg'}
            alt={post.author_name}
            className="w-full h-full object-cover"
          />
        </Link>

        {/* Content */}
        <div className="flex-1 space-y-3">
          <div>
            <Link
              to={isOwnPost ? '/profile' : `/user/${post.author_id}`}
              className="hover:text-primary transition-colors"
            >
              <h3 className="font-semibold text-lg text-foreground hover:underline">
                {post.author_name}
              </h3>
            </Link>
            <p className="text-sm text-muted-foreground">
              {formatTimestamp(post.timestamp)}
            </p>
          </div>

          <p className="text-lg text-foreground leading-relaxed">
            {post.content}
          </p>

          {/* Image */}
          {post.image_url && (
            <div className="mt-3">
              <ImageModal
                imageUrl={post.image_url}
                alt={`Image from ${post.author_name}'s post`}
                trigger={
                  <div className="relative w-fit rounded-lg overflow-hidden border border-border cursor-pointer hover:opacity-90 transition-opacity">
                    <img
                      src={post.image_url}
                      alt={`Post by ${post.author_name}`}
                      className="w-fit max-h-[200px] object-cover"
                    />
                  </div>
                }
              />
            </div>
          )}

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

            {isOwnPost ? (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => handleDelete(post.id)}
                  variant="secondary"
                  className="flex items-center gap-2 ml-auto w-[90px] shrink-0 hover:bg-destructive/10 hover:text-destructive"
                  disabled={isDeleting}
                >
                  <AnimatePresence mode="wait">
                    {isDeleting ? (
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
                        key="delete"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="flex items-center gap-2"
                      >
                        <Trash2 className="size-4" />
                        <span>Delete</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>
            ) : (
              post.author_wallet_address && (
                <div className="flex justify-between items-center w-full">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <TipModal
                      postId={post.id}
                      recipientAddress={post.author_wallet_address}
                      recipientName={post.author_name}
                      onTipSuccess={getPosts}
                      trigger={
                        <Button
                          onClick={(e) => {
                            if (!address && openConnectModal) {
                              e.preventDefault();
                              openConnectModal();
                            }
                          }}
                          variant="secondary"
                          className="flex items-center justify-start gap-2 w-[70px] shrink-0"
                        >
                          <DollarSign className="size-4" />
                          <span>Tip</span>
                        </Button>
                      }
                    />
                  </motion.div>

                  {/* Tips Display */}
                  {totalTips > 0 && (
                    <TipsListModal
                      tips={post.tips}
                      totalAmount={totalTips}
                      trigger={
                        <button
                          title={tipNames || 'No tips yet'}
                          className="flex h-[36px] items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-md cursor-pointer hover:bg-primary/20 transition-colors"
                        >
                          <span className="text-sm font-semibold text-foreground">
                            Total Tips: ${totalTips.toFixed(2)}
                          </span>
                        </button>
                      }
                    />
                  )}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
