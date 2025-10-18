import React from 'react';
import { Calendar, Heart } from 'lucide-react';

interface UserStatsProps {
  userPosts: number;
  totalLikes: number;
  userId: string;
}

export const UserStats = ({
  userPosts,
  totalLikes,
  userId,
}: UserStatsProps) => {
  return (
    <div className="flex gap-9 justify-center md:justify-start flex-wrap">
      <div className="flex items-center gap-1.5 text-sm">
        <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Calendar className="size-5 text-primary" />
        </div>
        <div className="flex flex-col items-center text-base -space-y-[1px]">
          <p className="font-semibold text-foreground">{userPosts}</p>
          <p className="text-muted-foreground">Posts</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-sm">
        <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Heart className="size-5 text-primary" />
        </div>
        <div className="flex flex-col items-center text-base -space-y-[1px]">
          <p className="font-semibold text-foreground">{totalLikes}</p>
          <p className="text-muted-foreground">Likes</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-sm">
        <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-base font-bold text-primary">ID</span>
        </div>
        <div className="flex flex-col items-center text-base -space-y-[1px]">
          <p className="font-semibold text-foreground">#{userId}</p>
          <p className="text-muted-foreground">User ID</p>
        </div>
      </div>
    </div>
  );
};
