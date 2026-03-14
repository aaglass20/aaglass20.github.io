import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as sheetsApi from '../api/sheetsApi';
import './MyPeoplePage.css';

const GROUP_OPTIONS = ['Family', 'Friends', 'Coworkers', 'Other'];

const MyPeoplePage = () => {
  const { user } = useAuth();
  const [follows, setFollows] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('people');
  const [filterGroup, setFilterGroup] = useState('All');
  const [editingGroup, setEditingGroup] = useState(null);

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const [followData, activityData] = await Promise.all([
        sheetsApi.getFollowedUsers(user.userId),
        sheetsApi.getFollowedUsersActivity(user.userId),
      ]);
      console.log('followData:', JSON.stringify(followData));
      if (followData?.follows) setFollows(followData.follows);
      if (activityData?.activity) {
        // Filter to only show activity added since last tab visit
        const storageKey = `lastActivityTabVisit_${user.userId}`;
        const lastVisit = localStorage.getItem(storageKey);
        if (lastVisit) {
          const newActivity = activityData.activity.filter(a => a.addedAt && a.addedAt > lastVisit);
          setActivity(newActivity);
        } else {
          // First visit — show everything
          setActivity(activityData.activity);
        }
      }
    } catch (e) {
      console.error('Failed to load followed users:', e);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  // Save timestamp when user visits the Activity tab
  useEffect(() => {
    if (activeTab === 'activity' && user) {
      const storageKey = `lastActivityTabVisit_${user.userId}`;
      localStorage.setItem(storageKey, new Date().toISOString());
    }
  }, [activeTab, user]);

  const handleUnfollow = async (followedUserId) => {
    setFollows(prev => prev.filter(f => f.followedUserId !== followedUserId));
    await sheetsApi.unfollowUser(user.userId, followedUserId);
  };

  const handleGroupChange = async (followedUserId, groupName) => {
    setFollows(prev => prev.map(f =>
      f.followedUserId === followedUserId ? { ...f, groupName } : f
    ));
    setEditingGroup(null);
    await sheetsApi.updateFollowGroup(user.userId, followedUserId, groupName);
  };

  const groups = ['All', ...GROUP_OPTIONS];
  const filteredFollows = filterGroup === 'All'
    ? follows
    : follows.filter(f => (f.groupName || 'Other') === filterGroup);

  // Get followed user IDs for activity filtering
  const followedIds = follows.map(f => f.followedUserId);
  const filteredActivity = filterGroup === 'All'
    ? activity
    : activity.filter(a => {
        const follow = follows.find(f => f.followedUserId === a.userId);
        return follow && (follow.groupName || 'Other') === filterGroup;
      });

  // Group activity by user
  const activityByUser = {};
  filteredActivity.forEach(a => {
    if (!followedIds.includes(a.userId)) return;
    if (!activityByUser[a.userId]) {
      activityByUser[a.userId] = { userName: a.userName, userId: a.userId, items: [] };
    }
    activityByUser[a.userId].items.push(a);
  });

  return (
    <div className="page my-people-page">
      <div className="page-header">
        <h2>My People</h2>
        <Link to="/browse" className="btn-add-people">+ Add People</Link>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : follows.length === 0 ? (
        <div className="empty-state">
          <p>You haven't followed anyone yet.</p>
          <Link to="/browse" className="btn-browse-link">Browse users to follow</Link>
        </div>
      ) : (
        <>
          <div className="people-tabs">
            <button
              className={`people-tab ${activeTab === 'people' ? 'active' : ''}`}
              onClick={() => setActiveTab('people')}
            >
              People ({follows.length})
            </button>
            <button
              className={`people-tab ${activeTab === 'activity' ? 'active' : ''}`}
              onClick={() => setActiveTab('activity')}
            >
              Activity
              {activity.length > 0 && <span className="activity-badge">{Object.keys(activityByUser).length}</span>}
            </button>
          </div>

          <div className="group-filter">
            {groups.map(g => (
              <button
                key={g}
                className={`group-chip ${filterGroup === g ? 'active' : ''}`}
                onClick={() => setFilterGroup(g)}
              >
                {g}
              </button>
            ))}
          </div>

          {activeTab === 'people' && (
            <div className="people-list">
              {filteredFollows.length === 0 ? (
                <div className="empty-state">No people in this group.</div>
              ) : (
                filteredFollows.map(f => (
                  <div key={f.followedUserId} className="people-card">
                    <Link to={`/user/${f.followedUserId}`} className="people-card-main">
                      <div className="people-avatar">
                        {(f.name || f.followedUserId || '?').charAt(0).toUpperCase()}
                      </div>
                      <div className="people-info">
                        <div className="people-name">{f.name || f.followedUserId}</div>
                        <div className="people-group-label">{f.groupName || 'No group'}</div>
                      </div>
                    </Link>
                    <div className="people-actions">
                      {editingGroup === f.followedUserId ? (
                        <div className="group-picker">
                          {GROUP_OPTIONS.map(g => (
                            <button
                              key={g}
                              className={`group-pick-btn ${f.groupName === g ? 'selected' : ''}`}
                              onClick={() => handleGroupChange(f.followedUserId, g)}
                            >
                              {g}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <>
                          <button
                            className="btn-edit-group"
                            onClick={() => setEditingGroup(f.followedUserId)}
                            title="Change group"
                          >
                            Group
                          </button>
                          <button
                            className="btn-unfollow"
                            onClick={() => handleUnfollow(f.followedUserId)}
                          >
                            Unfollow
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="activity-feed">
              {Object.keys(activityByUser).length === 0 ? (
                <div className="empty-state">No new activity from your people.</div>
              ) : (
                Object.values(activityByUser).map(userActivity => (
                  <div key={userActivity.userId} className="activity-user-section">
                    <Link to={`/user/${userActivity.userId}`} className="activity-user-header">
                      <div className="people-avatar small">
                        {userActivity.userName.charAt(0).toUpperCase()}
                      </div>
                      <span className="activity-user-name">{userActivity.userName}</span>
                    </Link>
                    <div className="activity-items">
                      {userActivity.items.slice(0, 5).map((item, i) => (
                        <div key={i} className="activity-item">
                          <span className="activity-type">
                            {item.type === 'timeline' ? `${item.year}` : `#${item.rank}`}
                          </span>
                          <span className="activity-song">{item.songTitle}</span>
                          <span className="activity-artist">{item.artist}</span>
                        </div>
                      ))}
                      {userActivity.items.length > 5 && (
                        <Link to={`/user/${userActivity.userId}`} className="activity-more">
                          + {userActivity.items.length - 5} more
                        </Link>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyPeoplePage;
