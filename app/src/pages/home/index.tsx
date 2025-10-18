import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useToast } from '@calimero-network/mero-ui';
import { useNavigate } from 'react-router-dom';
import { useCalimero } from '@calimero-network/calimero-client';
import { createKvClient, AbiClient } from '../../features/kv/api';
import type { Post } from '../../api/AbiClient';
import { motion } from 'motion/react';
import { PostCard } from '@/components/custom-ui/post-card';

export default function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated, app, appUrl } = useCalimero();
  const { show } = useToast();
  const [author, setAuthor] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [api, setApi] = useState<AbiClient | null>(null);
  const [_, setCurrentContext] = useState<{
    applicationId: string;
    contextId: string;
    nodeUrl: string;
  } | null>(null);
  const loadingPostsRef = useRef<boolean>(false);

  // Handles the navigation to the login page if the user is not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Create API client when app is available
  useEffect(() => {
    if (!app) return;

    const initializeApi = async () => {
      try {
        const client = await createKvClient(app);
        setApi(client);

        // Get context information
        const contexts = await app.fetchContexts();
        if (contexts.length > 0) {
          const context = contexts[0];
          setCurrentContext({
            applicationId: context.applicationId,
            contextId: context.contextId,
            nodeUrl: appUrl || 'http://node1.127.0.0.1.nip.io',
          });
        }
      } catch (error) {
        console.error('Failed to create API client:', error);
        window.alert('Failed to initialize API client');
      }
    };

    initializeApi();
  }, [app, appUrl]);

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

  // Handles the creation of a new post
  // const createPost = useCallback(async () => {
  //   if (!api || !author.trim() || !content.trim()) {
  //     show({
  //       title: 'Please enter both author and content',
  //       variant: 'error',
  //     });
  //     return;
  //   }
  //   try {
  //     await api.createPost({ author: author.trim(), content: content.trim() });
  //     await getPosts();
  //     show({
  //       title: `Post created successfully!`,
  //       variant: 'success',
  //     });
  //     setAuthor('');
  //     setContent('');
  //   } catch (error) {
  //     console.error('createPost error:', error);
  //     show({
  //       title: error instanceof Error ? error.message : 'Failed to create post',
  //       variant: 'error',
  //     });
  //   }
  // }, [api, author, content, getPosts, show]);

  // Handles the liking of a post
  const handleLikePost = useCallback(
    async (postId: string) => {
      if (!api) return;
      try {
        await api.likePost({ id: postId });
        await getPosts();
        show({
          title: `Post liked!`,
          variant: 'success',
        });
      } catch (error) {
        console.error('likePost error:', error);
        show({
          title: error instanceof Error ? error.message : 'Failed to like post',
          variant: 'error',
        });
      }
    },
    [api, getPosts, show],
  );

  // On page load, retrieve all posts if authenticated and API is available
  useEffect(() => {
    if (isAuthenticated && api) {
      getPosts();
    }
  }, [isAuthenticated, api, getPosts]);

  return (
    <div className="min-h-screen py-8 px-6 overflow-y-scroll">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-2 glow-text">
            Feed
          </h1>
          <p className="text-muted-foreground">See what's happening</p>
        </motion.div>

        <div className="space-y-6">
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <PostCard post={post} onLike={() => handleLikePost(post.id)} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
