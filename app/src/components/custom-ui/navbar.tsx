'use client';

import React, { useCallback } from 'react';
import { motion } from 'motion/react';
import { useCalimero } from '@calimero-network/calimero-client';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../shadcn-ui/button';
import { cn } from '@/lib/utils';

export function Navbar() {
  const navigate = useNavigate();
  const { logout } = useCalimero();
  const location = useLocation();

  // Handles the logout of the user
  const doLogout = useCallback(() => {
    logout();
    navigate('/');
  }, [logout, navigate]);

  // Navbar links
  const navLinks = [
    { href: '/home', label: 'Home' },
    { href: '/profile', label: 'Profile' },
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
          <a href="/home" className="hidden md:block cursor-pointer">
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
          </a>

          {/* Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="cursor-pointer">
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  className={cn(
                    'text-xl text-muted-foreground hover:text-primary transition-colors',
                    location.pathname === link.href && 'text-primary',
                  )}
                >
                  {link.label}
                </motion.span>
              </a>
            ))}
          </div>

          {/* Logout Button */}
          <div className="flex justify-end items-center w-[353px]">
            <Button onClick={doLogout}>Logout</Button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
