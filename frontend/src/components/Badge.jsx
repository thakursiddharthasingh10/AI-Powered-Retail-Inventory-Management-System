import React from 'react';

export const Badge = ({ variant = 'neutral', children }) => {
  return <span className={`badge badge-${variant}`}>{children}</span>;
};

export default Badge;
