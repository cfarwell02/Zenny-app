import React, { createContext, useState } from "react";

// 1. Create the context
export const NotificationContext = createContext();

// 2. Create the provider component
export const NotificationProvider = ({ children }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  return (
    <NotificationContext.Provider
      value={{ notificationsEnabled, setNotificationsEnabled }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
