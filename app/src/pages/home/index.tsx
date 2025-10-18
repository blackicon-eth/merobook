import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Button,
  Input,
  Grid,
  GridItem,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  useToast,
  Text,
} from '@calimero-network/mero-ui';
import { Heart } from '@calimero-network/mero-icons';
import { useNavigate } from 'react-router-dom';
import { useCalimero } from '@calimero-network/calimero-client';
import { createKvClient, AbiClient } from '../../features/kv/api';
import type { Post } from '../../api/AbiClient';
import { formatTimestamp } from '@/lib/utils';

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
  const createPost = useCallback(async () => {
    if (!api || !author.trim() || !content.trim()) {
      show({
        title: 'Please enter both author and content',
        variant: 'error',
      });
      return;
    }
    try {
      await api.createPost({ author: author.trim(), content: content.trim() });
      await getPosts();
      show({
        title: `Post created successfully!`,
        variant: 'success',
      });
      setAuthor('');
      setContent('');
    } catch (error) {
      console.error('createPost error:', error);
      show({
        title: error instanceof Error ? error.message : 'Failed to create post',
        variant: 'error',
      });
    }
  }, [api, author, content, getPosts, show]);

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
    <div className="w-full h-full text-foreground overflow-y-scroll">
      <Grid
        columns={1}
        gap={32}
        maxWidth="100%"
        justify="center"
        align="center"
        style={{
          minHeight: '100vh',
          padding: '2rem',
        }}
      >
        <GridItem>
          <main
            style={{
              width: '100%',
              maxWidth: '1200px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ maxWidth: '800px', width: '100%' }}>
              <Card variant="rounded" style={{ marginBottom: '2rem' }}>
                <CardHeader>
                  <CardTitle>Create a New Post</CardTitle>
                </CardHeader>
                <CardContent>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      createPost();
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1.5rem',
                      width: '100%',
                    }}
                  >
                    <Input
                      type="text"
                      placeholder="Your name"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      style={{ width: '100%' }}
                    />
                    <Input
                      type="text"
                      placeholder="What's on your mind?"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      style={{ width: '100%' }}
                    />
                    <Button
                      type="submit"
                      variant="success"
                      style={{
                        width: '100%',
                        minHeight: '3rem',
                      }}
                    >
                      Post
                    </Button>
                  </form>
                </CardContent>
              </Card>
              <Card variant="rounded" style={{ width: '100%' }}>
                <CardHeader>
                  <CardTitle>Feed</CardTitle>
                </CardHeader>
                <CardContent>
                  {posts.length === 0 ? (
                    <div
                      style={{
                        color: '#aaa',
                        textAlign: 'center',
                        padding: '3rem 2rem',
                        fontSize: '1.1rem',
                        fontStyle: 'italic',
                      }}
                    >
                      No posts yet. Be the first to post!
                    </div>
                  ) : (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                      }}
                    >
                      {posts.map((post) => (
                        <Card key={post.id} style={{ padding: '1rem' }}>
                          <div style={{ marginBottom: '0.5rem' }}>
                            <Text
                              size="lg"
                              style={{ fontWeight: 'bold', color: '#e5e7eb' }}
                            >
                              {post.author}
                            </Text>
                            <Text
                              size="sm"
                              color="muted"
                              style={{ marginTop: '0.25rem' }}
                            >
                              {formatTimestamp(post.timestamp)}
                            </Text>
                          </div>
                          <Text
                            size="md"
                            style={{ marginBottom: '1rem', color: '#d1d5db' }}
                          >
                            {post.content}
                          </Text>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                            }}
                          >
                            <Button
                              onClick={() => handleLikePost(post.id)}
                              style={{
                                padding: '8px 16px',
                                minWidth: 'auto',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                              }}
                            >
                              <Heart size={18} />
                              <Text size="sm">{post.likes}</Text>
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
        </GridItem>
      </Grid>
    </div>
  );
}
