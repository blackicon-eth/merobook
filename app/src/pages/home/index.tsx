import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCalimero } from '@calimero-network/calimero-client';
import type { Post } from '../../api/AbiClient';
import { motion } from 'motion/react';
import { PostCard } from '@/components/custom-ui/post-card';
import { Button } from '@/components/shadcn-ui/button';
import { PlusIcon } from 'lucide-react';
import { CreatePostModal } from '@/components/custom-ui/create-post-modal';
import { useGeneralContext } from '@/contexts/general-context';

export default function HomePage() {
  const navigate = useNavigate();
  const { api } = useGeneralContext();
  const { isAuthenticated } = useCalimero();
  const [posts, setPosts] = useState<Post[]>([]);
  const loadingPostsRef = useRef<boolean>(false);

  // Handles the navigation to the login page if the user is not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

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

  // On page load, retrieve all posts if authenticated and API is available
  useEffect(() => {
    if (isAuthenticated && api) {
      getPosts();
    }
  }, [isAuthenticated, api, getPosts]);

  return (
    <div className="h-full p-10 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div className="flex flex-col justify-center items-start gap-2">
            <h1 className="text-4xl md:text-5xl font-bold mb-2"> Your Feed</h1>
            <p className="text-muted-foreground">
              See what's happening in your neighborhood
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

        <div className="space-y-6">
          {posts.map((post, index) => (
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
      </div>
    </div>
  );
}
