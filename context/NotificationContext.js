import React, { createContext, useState } from "react";

export const NotificationContext = createContext();

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
