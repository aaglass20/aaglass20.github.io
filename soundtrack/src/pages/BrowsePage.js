import React, { useState, useEffect } from 'react';
import * as sheetsApi from '../api/sheetsApi';
import UserCard from '../components/UserCard';

const BrowsePage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await sheetsApi.getAllUsers();
        if (data && data.users) setUsers(data.users);
      } catch (e) {
        console.error('Failed to load users:', e);
      }
      setLoading(false);
    };
    load();
  }, []);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page browse-page">
      <div className="page-header">
        <h2>Browse Soundtracks</h2>
      </div>

      <input
        type="text"
        className="browse-search"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search users..."
      />

      {loading ? (
        <div className="loading">Loading users...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          {search ? 'No users match your search.' : 'No users yet. Be the first!'}
        </div>
      ) : (
        <div className="user-list">
          {filtered.map(u => (
            <UserCard key={u.userId} user={u} />
          ))}
        </div>
      )}
    </div>
  );
};

export default BrowsePage;
