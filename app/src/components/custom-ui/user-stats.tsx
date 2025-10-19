import React from 'react';
import { FollowListModal } from './follow-list-modal';

interface UserStatsProps {
  userPosts: number;
  totalLikes: number;
  followersCount?: number;
  followingCount?: number;
  followerIds?: string[];
  followingIds?: string[];
}

export const UserStats = ({
  userPosts,
  totalLikes,
  followersCount = 0,
  followingCount = 0,
  followerIds = [],
  followingIds = [],
}: UserStatsProps) => {
  return (
    <div className="flex gap-9 justify-center md:justify-start flex-wrap">
      <div className="flex items-center gap-1.5 text-sm">
        <div className="flex flex-col items-center text-base -space-y-[1px]">
          <p className="font-semibold text-foreground">{userPosts}</p>
          <p className="text-muted-foreground">Posts</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-sm">
        <div className="flex flex-col items-center text-base -space-y-[1px]">
          <p className="font-semibold text-foreground">{totalLikes}</p>
          <p className="text-muted-foreground">Likes</p>
        </div>
      </div>

      <FollowListModal
        userIds={followerIds}
        title="Followers"
        description={`${followersCount} ${followersCount === 1 ? 'follower' : 'followers'}`}
        trigger={
          <button className="flex items-center gap-1.5 text-sm cursor-pointer hover:opacity-80 transition-opacity">
            <div className="flex flex-col items-center text-base -space-y-[1px]">
              <p className="font-semibold text-foreground">{followersCount}</p>
              <p className="text-muted-foreground">Followers</p>
            </div>
          </button>
        }
      />

      <FollowListModal
        userIds={followingIds}
        title="Following"
        description={`${followingCount} ${followingCount === 1 ? 'user' : 'users'} followed`}
        trigger={
          <button className="flex items-center gap-1.5 text-sm cursor-pointer hover:opacity-80 transition-opacity">
            <div className="flex flex-col items-center text-base -space-y-[1px]">
              <p className="font-semibold text-foreground">{followingCount}</p>
              <p className="text-muted-foreground">Following</p>
            </div>
          </button>
        }
      />
    </div>
  );
};
