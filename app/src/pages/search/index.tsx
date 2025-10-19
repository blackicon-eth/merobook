import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCalimero } from '@calimero-network/calimero-client';
import type { User } from '../../api/AbiClient';
import { motion } from 'motion/react';
import { Card } from '@/components/shadcn-ui/card';
import { useGeneralContext } from '@/contexts/general-context';
import { Loader2, Search, Users } from 'lucide-react';
import { Input } from '@/components/shadcn-ui/input';
import { Link } from 'react-router-dom';

export default function SearchPage() {
  const navigate = useNavigate();
  const { api, currentUser } = useGeneralContext();
  const { isAuthenticated } = useCalimero();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedQuery, setDebouncedQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Handles the navigation to the login page if the user is not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Search users when debounced query changes
  const searchUsers = useCallback(async () => {
    if (!api || !debouncedQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await api.searchUsersByName({
        name_prefix: debouncedQuery.trim(),
      });
      setSearchResults(results);
    } catch (error) {
      console.error('searchUsers error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [api, debouncedQuery]);

  useEffect(() => {
    searchUsers();
  }, [searchUsers]);

  return (
    <div className="h-full p-10 overflow-y-auto">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Search className="size-6 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-foreground glow-text">
              Search Users
            </h1>
          </div>
          <p className="text-muted-foreground ml-13">
            Find and connect with other users
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search users by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-lg border-border bg-card/50 backdrop-blur focus:border-primary"
              autoFocus
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 size-5 text-primary animate-spin" />
            )}
          </div>
        </motion.div>

        {/* Search Results */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {!debouncedQuery.trim() ? (
            <Card className="p-12 text-center bg-card/50 backdrop-blur border-border">
              <Users className="size-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground text-lg">
                Start typing to search for users
              </p>
            </Card>
          ) : isSearching ? (
            <Card className="p-12 text-center bg-card/50 backdrop-blur border-border">
              <Loader2 className="size-16 text-primary mx-auto mb-4 animate-spin" />
              <p className="text-muted-foreground">Searching...</p>
            </Card>
          ) : searchResults.length === 0 ? (
            <Card className="p-12 text-center bg-card/50 backdrop-blur border-border">
              <Users className="size-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground text-lg mb-2">
                No users found
              </p>
              <p className="text-sm text-muted-foreground">
                Try searching with a different name
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {searchResults.map((user, index) => {
                const isOwnProfile = currentUser?.id === user.id;
                return (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to={isOwnProfile ? '/profile' : `/user/${user.id}`}
                      className="block"
                    >
                      <Card className="p-6 bg-card/50 backdrop-blur border-border hover:border-primary/50 transition-all duration-200 cursor-pointer glow-border">
                        <div className="flex items-center gap-4">
                          {/* Avatar */}
                          <div className="relative">
                            <div className="absolute inset-0 rounded-full bg-primary/20 blur-md" />
                            <div className="relative size-16 rounded-full overflow-hidden border-2 border-primary/20">
                              <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>

                          {/* User Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-xl font-semibold text-foreground truncate">
                                {user.name}
                              </h3>
                              {isOwnProfile && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                                  You
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {user.bio}
                            </p>
                            <p className="text-xs text-muted-foreground/60 mt-1 font-mono">
                              ID: #{user.id}
                            </p>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
