'use client';

import React, { useCallback } from 'react';
import { motion } from 'motion/react';
import { useCalimero } from '@calimero-network/calimero-client';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../shadcn-ui/button';
import { cn } from '@/lib/utils';
import { useGeneralContext } from '@/contexts/general-context';
import { UserCircle, Home, User } from 'lucide-react';

export function Navbar() {
  const navigate = useNavigate();
  const { logout } = useCalimero();
  const location = useLocation();
  const { currentUser, isLoadingUser } = useGeneralContext();

  // Handles the logout of the user
  const doLogout = useCallback(() => {
    logout();
    navigate('/');
  }, [logout, navigate]);

  // Navbar links
  const navLinks = [
    { href: '/home', label: 'Home', icon: Home },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl"
    >
      <div className="w-full px-4 sm:px-6 lg:px-10">
        <div className="flex h-16 sm:h-20 items-center justify-between">
          {/* Logo */}
          <Link to="/home" className="hidden md:block cursor-pointer">
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="flex items-center gap-2 w-[353px]"
            >
              <div className="relative size-9">
                <div className="absolute inset-0 rounded-lg bg-primary/20 blur-sm" />
                <div className="relative flex h-full w-full items-center justify-center rounded-lg border border-primary bg-card">
                  <span className="text-2xl font-bold text-primary glow-text">
                    Ø
                  </span>
                </div>
              </div>
              <span className="text-3xl font-bold text-primary glow-text">
                MEROBOOK
              </span>
            </motion.div>
          </Link>

          {/* Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link key={link.href} to={link.href} className="cursor-pointer">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className={cn(
                      'flex items-center gap-2 text-xl text-muted-foreground hover:text-primary transition-colors',
                      location.pathname === link.href && 'text-primary',
                    )}
                  >
                    <Icon className="size-5" />
                    <span>{link.label}</span>
                  </motion.div>
                </Link>
              );
            })}
          </div>

          {/* User Info & Logout */}
          <div className="flex justify-end items-center gap-3 w-[353px]">
            {isLoadingUser ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="size-6 rounded-full bg-muted animate-pulse" />
                Loading...
              </div>
            ) : currentUser ? (
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-full overflow-hidden bg-secondary border border-primary shrink-0">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-sm font-medium text-foreground hidden lg:inline">
                  {currentUser.name}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <UserCircle className="size-6" />
                <span className="hidden lg:inline">Not registered</span>
              </div>
            )}
            <Button onClick={doLogout} size="sm">
              Logout
            </Button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
