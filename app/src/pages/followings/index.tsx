import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCalimero } from '@calimero-network/calimero-client';
import type { Post } from '../../api/AbiClient';
import { motion } from 'motion/react';
import { PostCard } from '@/components/custom-ui/post-card';
import { Button } from '@/components/shadcn-ui/button';
import { PlusIcon, Loader2 } from 'lucide-react';
import { CreatePostModal } from '@/components/custom-ui/create-post-modal';
import { useGeneralContext } from '@/contexts/general-context';
import { Card } from '@/components/shadcn-ui/card';

export default function FollowingsPage() {
  const navigate = useNavigate();
  const { api, currentUser } = useGeneralContext();
  const { isAuthenticated } = useCalimero();
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const loadingPostsRef = useRef<boolean>(false);

  // Handles the navigation to the login page if the user is not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Fetch following list
  const getFollowing = useCallback(async () => {
    if (!api || !currentUser) return;
    try {
      const followingData = await api.getFollowing({
        user_id: currentUser.id,
      });
      setFollowingIds(followingData);
    } catch (error) {
      console.error('getFollowing error:', error);
    }
  }, [api, currentUser]);

  // Handles the retrieval of all posts
  const getPosts = useCallback(async () => {
    if (loadingPostsRef.current || !api) return;
    loadingPostsRef.current = true;
    try {
      const data = await api.getAllPosts();
      setPosts(data);
    } catch (error) {
      console.error('getPosts error:', error);
      window.alert(
        error instanceof Error ? error.message : 'Failed to load posts',
      );
    } finally {
      loadingPostsRef.current = false;
    }
  }, [api]);

  // Filter posts to only show posts from followed users
  useEffect(() => {
    if (followingIds.length > 0 && posts.length > 0) {
      const filtered = posts.filter((post) =>
        followingIds.includes(post.author_id),
      );
      setFilteredPosts(filtered);
      setIsLoading(false);
    } else if (followingIds.length === 0 && !loadingPostsRef.current) {
      setFilteredPosts([]);
      setIsLoading(false);
    }
  }, [posts, followingIds]);

  // On page load, retrieve following list and all posts
  useEffect(() => {
    if (isAuthenticated && api && currentUser) {
      setIsLoading(true);
      getFollowing();
      getPosts();
    }
  }, [isAuthenticated, api, currentUser, getFollowing, getPosts]);

  return (
    <div className="h-full p-10 overflow-y-auto">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div className="flex flex-col justify-center items-start gap-2">
            <h1 className="text-4xl md:text-5xl font-bold mb-2">Following</h1>
            <p className="text-muted-foreground">
              Posts from all the people you follow
            </p>
          </div>

          <CreatePostModal
            trigger={
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2"
              >
                <Button variant="secondary" size="lg">
                  <PlusIcon className="w-4 h-4" />
                  New Post
                </Button>
              </motion.div>
            }
            getPosts={getPosts}
          />
        </motion.div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        ) : filteredPosts.length === 0 ? (
          <Card className="p-8 text-center bg-card/50 backdrop-blur border-border">
            <div className="flex flex-col items-center gap-4">
              <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No posts yet
                </h3>
                <p className="text-muted-foreground">
                  {followingIds.length === 0
                    ? "You're not following anyone yet. Start following users to see their posts here!"
                    : "The people you follow haven't posted anything yet."}
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <PostCard post={post} getPosts={getPosts} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
