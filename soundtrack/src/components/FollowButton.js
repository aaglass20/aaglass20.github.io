import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import * as sheetsApi from '../api/sheetsApi';

// Cache followed users to avoid repeated API calls
let followCache = null;
let followCacheUserId = null;
let followCachePromise = null;

const getFollowedUsersCache = async (userId) => {
  if (followCacheUserId === userId && followCache !== null) return followCache;
  if (followCacheUserId === userId && followCachePromise) return followCachePromise;

  followCacheUserId = userId;
  followCachePromise = sheetsApi.getFollowedUsers(userId).then(data => {
    followCache = data?.follows || [];
    followCachePromise = null;
    return followCache;
  }).catch(() => {
    followCache = [];
    followCachePromise = null;
    return [];
  });
  return followCachePromise;
};

// Call this after follow/unfollow to bust the cache
const invalidateCache = () => {
  followCache = null;
  followCachePromise = null;
};

const FollowButton = ({ targetUserId }) => {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!user || user.userId === targetUserId) return;
    getFollowedUsersCache(user.userId).then(follows => {
      setIsFollowing(follows.some(f => f.followedUserId === targetUserId));
      setReady(true);
    });
  }, [user, targetUserId]);

  if (!user || user.userId === targetUserId) return null;

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isFollowing) {
      setIsFollowing(false);
      invalidateCache();
      await sheetsApi.unfollowUser(user.userId, targetUserId);
    } else {
      setIsFollowing(true);
      invalidateCache();
      await sheetsApi.followUser(user.userId, targetUserId, '');
    }
  };

  return (
    <button
      className={`btn-follow ${isFollowing ? 'following' : ''}`}
      onClick={handleClick}
      disabled={!ready}
      style={!ready ? { opacity: 0.5 } : undefined}
    >
      {isFollowing ? 'Following' : 'Follow'}
    </button>
  );
};

export default FollowButton;
