// src/Notifications.js
import React, { useEffect, useState } from 'react';
import socketIOClient from "socket.io-client";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const socket = socketIOClient("http://localhost:4000");

    socket.on('notification', message => {
      setNotifications(notifications => [...notifications, message]);
    });

    return () => socket.disconnect();
  }, []);

  return (
    <div>
      <h2>Notifications</h2>
      <ul>
        {notifications.length ? notifications.map((notification, index) => (
          <li key={index}>{notification}</li>
        )) : <li>No Notifications</li>}
      </ul>
    </div>
  );
};

export default Notifications;
