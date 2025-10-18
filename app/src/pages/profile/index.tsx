import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCalimero } from '@calimero-network/calimero-client';
import type { Post } from '../../api/AbiClient';
import { motion } from 'motion/react';
import { PostCard } from '@/components/custom-ui/post-card';
import { Card } from '@/components/shadcn-ui/card';
import { useGeneralContext } from '@/contexts/general-context';
import { Loader2, Calendar, PlusIcon, Pencil, ArrowLeft } from 'lucide-react';
import { CreatePostModal } from '@/components/custom-ui/create-post-modal';
import { EditProfileModal } from '@/components/custom-ui/edit-profile-modal';
import { Button } from '@/components/shadcn-ui/button';
import { UserStats } from '@/components/custom-ui/user-stats';
import { AddressBanner } from '@/components/custom-ui/address-banner';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { api, currentUser, isLoadingUser } = useGeneralContext();
  const { isAuthenticated } = useCalimero();
  const [posts, setPosts] = useState<Post[]>([]);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
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
    } finally {
      loadingPostsRef.current = false;
    }
  }, [api]);

  // Filter posts by current user
  useEffect(() => {
    if (currentUser && posts.length > 0) {
      const filtered = posts.filter(
        (post) => post.author_id === currentUser.id,
      );
      setUserPosts(filtered);
    }
  }, [currentUser, posts]);

  // On page load, retrieve all posts if authenticated and API is available
  useEffect(() => {
    if (isAuthenticated && api) {
      getPosts();
    }
  }, [isAuthenticated, api, getPosts]);

  // Calculate stats
  const totalLikes = userPosts.reduce(
    (sum, post) => sum + post.likes.length,
    0,
  );

  if (isLoadingUser) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="h-full flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No user found</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full p-10 overflow-y-scroll">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-4"
        >
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            size="sm"
            className="gap-2"
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>
        </motion.div>

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="p-8 bg-card/50 backdrop-blur border-border relative">
            {/* Edit Button */}
            <div className="absolute top-4 right-4">
              <EditProfileModal
                trigger={
                  <Button
                    variant="secondary"
                    size="icon"
                    className="size-9 hover:bg-primary/10"
                  >
                    <Pencil className="size-4" />
                  </Button>
                }
              />
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              {/* Avatar */}
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl" />
                <div className="relative size-32 rounded-full overflow-hidden border-4 border-primary/20">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* User Info */}
              <div className="relative flex-1 text-center md:text-left">
                <div className="flex justify-start items-center gap-4 mb-2">
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                    {currentUser.name}
                  </h1>
                  {/* Wallet Address */}
                  <AddressBanner address={currentUser.wallet_address} />
                </div>
                <p className="text-muted-foreground mb-4 max-w-xl">
                  {currentUser.bio}
                </p>

                {/* Stats */}
                <UserStats
                  userPosts={userPosts.length}
                  totalLikes={totalLikes}
                  userId={currentUser.id}
                />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Posts Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-between items-center mb-6"
        >
          <div className="flex flex-col items-start">
            <h2 className="text-2xl font-bold text-foreground">
              Your Posts ({userPosts.length})
            </h2>
            <p className="text-muted-foreground">
              All the posts you've shared with the community
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

        {/* Posts List */}
        <div className="space-y-6">
          {userPosts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-12 text-center bg-card/30">
                <div className="flex flex-col items-center gap-4">
                  <div className="size-16 rounded-full bg-muted flex items-center justify-center">
                    <Calendar className="size-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      No posts yet
                    </h3>
                    <p className="text-muted-foreground">
                      Share your first post to get started!
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ) : (
            userPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <PostCard post={post} getPosts={getPosts} />
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
