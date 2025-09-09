import React from 'react';

const Notifications = ({ message }) => {
  if (!message) return null;  // don't show anything if no message

  return (
    <div className="notifications">
      <h2>Notification</h2>
      <p>{message}</p>
    </div>
  );
};

export default Notifications;
