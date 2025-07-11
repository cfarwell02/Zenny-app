import React, { createContext, useState, useContext, useEffect } from "react";
import { DataContext } from "./DataContext";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const { userData, saveNotificationSettings } = useContext(DataContext);

  // Sync with DataContext
  useEffect(() => {
    if (userData.notificationSettings) {
      setNotificationsEnabled(userData.notificationSettings.enabled || false);
    }
  }, [userData.notificationSettings]);

  const updateNotificationSettings = async (enabled) => {
    setNotificationsEnabled(enabled);
    await saveNotificationSettings({ enabled });
  };

  return (
    <NotificationContext.Provider
      value={{
        notificationsEnabled,
        setNotificationsEnabled: updateNotificationSettings,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
