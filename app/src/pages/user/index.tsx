import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCalimero } from '@calimero-network/calimero-client';
import type { Post, User } from '../../api/AbiClient';
import { motion } from 'motion/react';
import { PostCard } from '@/components/custom-ui/post-card';
import { Card } from '@/components/shadcn-ui/card';
import { useGeneralContext } from '@/contexts/general-context';
import { Loader2, Calendar, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/shadcn-ui/button';
import { UserStats } from '@/components/custom-ui/user-stats';
import { AddressBanner } from '@/components/custom-ui/address-banner';

export default function UserProfilePage() {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const { api, currentUser } = useGeneralContext();
  const { isAuthenticated } = useCalimero();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [isLoadingUser, setIsLoadingUser] = useState<boolean>(true);
  const loadingPostsRef = useRef<boolean>(false);

  // Handles the navigation to the login page if the user is not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Fetch the user by ID
  const fetchUser = useCallback(async () => {
    if (!api || !userId) return;
    setIsLoadingUser(true);
    try {
      const userData = await api.getUser({ id: userId });
      setUser(userData);
    } catch (error) {
      console.error('fetchUser error:', error);
      setUser(null);
    } finally {
      setIsLoadingUser(false);
    }
  }, [api, userId]);

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

  // Filter posts by the viewed user
  useEffect(() => {
    if (user && posts.length > 0) {
      const filtered = posts.filter((post) => post.author_id === user.id);
      setUserPosts(filtered);
    }
  }, [user, posts]);

  // On page load, fetch user and posts
  useEffect(() => {
    if (isAuthenticated && api) {
      fetchUser();
      getPosts();
    }
  }, [isAuthenticated, api, fetchUser, getPosts]);

  // Calculate stats
  const totalLikes = userPosts.reduce(
    (sum, post) => sum + post.likes.length,
    0,
  );

  // Check if viewing own profile
  const isOwnProfile = currentUser?.id === userId;

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

  if (!user) {
    return (
      <div className="h-full flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">User not found</p>
          <Button onClick={() => navigate('/home')} variant="outline">
            <ArrowLeft className="size-4 mr-2" />
            Back to Home
          </Button>
        </Card>
      </div>
    );
  }

  // Redirect to own profile if viewing own user
  if (isOwnProfile) {
    navigate('/profile');
    return null;
  }

  return (
    <div className="h-full p-10 overflow-y-auto">
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
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              {/* Avatar */}
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl" />
                <div className="relative size-32 rounded-full overflow-hidden border-4 border-primary/20">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* User Info */}
              <div className="relative flex-1 text-center md:text-left">
                <div className="flex justify-start items-center gap-4 mb-2">
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                    {user.name}
                  </h1>
                  {/* Wallet Address */}
                  <AddressBanner address={user.wallet_address} />
                </div>
                <p className="text-muted-foreground mb-4 max-w-xl">
                  {user.bio}
                </p>

                {/* Stats */}
                <UserStats
                  userPosts={userPosts.length}
                  totalLikes={totalLikes}
                  userId={user.id}
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
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              Posts ({userPosts.length})
            </h2>
          </div>

          {userPosts.length === 0 ? (
            <Card className="p-12 text-center bg-card/50 backdrop-blur border-border">
              <div className="flex flex-col items-center gap-4">
                <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Calendar className="size-8 text-primary/50" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No posts yet
                  </h3>
                  <p className="text-muted-foreground">
                    This user hasn't posted anything yet.
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {userPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <PostCard post={post} getPosts={getPosts} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
