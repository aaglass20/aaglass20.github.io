import React from 'react';
import { Link } from 'react-router-dom';

const UserCard = ({ user }) => {
  const songCount = user.songCount || 0;
  const currentYear = new Date().getFullYear();
  const totalYears = user.birthYear ? currentYear - user.birthYear + 1 : 0;
  const pct = totalYears > 0 ? Math.round((songCount / totalYears) * 100) : 0;

  return (
    <Link to={`/user/${user.userId}`} className="user-card">
      <div className="user-card-avatar">
        {user.name.charAt(0).toUpperCase()}
      </div>
      <div className="user-card-info">
        <div className="user-card-name">{user.name}</div>
        <div className="user-card-stats">
          {songCount} songs · {pct}% complete
        </div>
      </div>
      <div className="user-card-arrow">→</div>
    </Link>
  );
};

export default UserCard;
