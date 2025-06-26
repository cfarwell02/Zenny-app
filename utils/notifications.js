export const checkBudgetThreshold = async ({
  category,
  spent,
  budgetLimit,
  threshold,
  notificationsEnabled,
}) => {
  if (!notificationsEnabled || !budgetLimit || !threshold) return;

  const percentSpent = (spent / budgetLimit) * 100;

  if (percentSpent >= threshold) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Budget Alert ⚠️",
        body: `You've spent ${percentSpent.toFixed(
          0
        )}% of your ${category} budget!`,
      },
      trigger: null,
    });
  }
};

export const checkBudgetOverage = async ({
  category,
  spentSoFar,
  addedAmount,
  budgetLimit,
  notificationsEnabled,
}) => {
  if (!notificationsEnabled || !budgetLimit) return;

  const newTotal = spentSoFar + addedAmount;
  if (newTotal > budgetLimit) {
    const overBy = newTotal - budgetLimit;
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "⚠️ Budget Alert",
        body: `You went over your ${category} budget by $${overBy.toFixed(2)}.`,
      },
      trigger: null,
    });
  }
};
