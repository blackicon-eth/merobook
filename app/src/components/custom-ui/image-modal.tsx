'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '../shadcn-ui/dialog';

interface ImageModalProps {
  imageUrl: string;
  alt?: string;
  trigger: React.ReactNode;
}

export function ImageModal({
  imageUrl,
  alt = 'Post image',
  trigger,
}: ImageModalProps) {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="min-w-[40%] p-0 bg-transparent border-none overflow-hidden">
        {/* Image */}
        <img
          src={imageUrl}
          alt={alt}
          className="w-full h-full object-contain rounded-lg"
          onClick={(e) => e.stopPropagation()}
        />
      </DialogContent>
    </Dialog>
  );
}
