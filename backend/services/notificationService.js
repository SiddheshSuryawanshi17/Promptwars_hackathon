/**
 * Notification Service
 * Handles alerts and notifications to users
 */

class NotificationService {
  constructor(io) {
    this.io = io;
    this.subscriptions = new Map();
    this.notificationHistory = [];
  }

  /**
   * Subscribe user to facility alerts
   */
  subscribeToFacility(userId, facilityId, threshold = null) {
    const key = `${userId}_${facilityId}`;

    this.subscriptions.set(key, {
      userId,
      facilityId,
      threshold, // Alert if wait time is below this
      subscribedAt: new Date()
    });
  }

  /**
   * Send notification to user
   */
  notifyUser(userId, notification) {
    const message = {
      id: Math.random().toString(36).substr(2, 9),
      ...notification,
      timestamp: new Date()
    };

    // Store in history
    this.notificationHistory.push(message);

    // Keep only last 1000 notifications
    if (this.notificationHistory.length > 1000) {
      this.notificationHistory.shift();
    }

    // Emit to specific user (if connected)
    this.io.to(`user_${userId}`).emit('notification', message);

    // Also emit via push notification service (implement as needed)
    this._sendPushNotification(userId, message);

    return message;
  }

  /**
   * Broadcast facility alert
   */
  broadcastFacilityAlert(facilityId, facility) {
    // Find all users subscribed to this facility
    const subscribers = Array.from(this.subscriptions.values()).filter(
      sub => sub.facilityId === facilityId
    );

    subscribers.forEach(sub => {
      if (
        sub.threshold === null ||
        facility.currentWaitTime < sub.threshold
      ) {
        this.notifyUser(sub.userId, {
          type: 'facility_alert',
          facilityId,
          facility,
          message: `${facility.name} now has a wait time of ${facility.currentWaitTime} minutes!`,
          icon: this._getIcon(facility.type)
        });
      }
    });
  }

  /**
   * Send event reminder
   */
  sendEventReminder(userId, event, minutesBefore = 15) {
    this.notifyUser(userId, {
      type: 'event_reminder',
      eventId: event.id,
      event,
      message: `${event.title} starts in ${minutesBefore} minutes at ${event.location}`,
      icon: '🎬',
      actionUrl: `/events/${event.id}`
    });
  }

  /**
   * Send facility closure alert
   */
  sendFacilityClosureAlert(facilityId, facility, reason = 'Maintenance') {
    // Notify all subscribed users
    const subscribers = Array.from(this.subscriptions.values()).filter(
      sub => sub.facilityId === facilityId
    );

    subscribers.forEach(sub => {
      this.notifyUser(sub.userId, {
        type: 'facility_closure',
        facilityId,
        facility,
        message: `${facility.name} is now closed (${reason})`,
        icon: '🔴',
        severity: 'high'
      });
    });
  }

  /**
   * Send optimal visit time suggestion
   */
  sendOptimalTimeNotification(userId, facility, optimalTime) {
    this.notifyUser(userId, {
      type: 'optimal_time',
      facilityId: facility.id,
      facility,
      message: `Best time to visit ${facility.name} is around ${optimalTime.hour}:00. Expected wait: ${optimalTime.expectedWait} min`,
      icon: '⏰',
      actionUrl: `/facilities/${facility.id}`
    });
  }

  /**
   * Send crowd alert
   */
  sendCrowdAlert(userId, facilities) {
    this.notifyUser(userId, {
      type: 'crowd_alert',
      message: 'Venue is getting crowded. Consider visiting less busy facilities.',
      icon: '👥',
      facilities
    });
  }

  /**
   * Get notifications for user
   */
  getNotifications(userId, limit = 20) {
    return this.notificationHistory
      .filter(n => n.userId === userId || !n.userId) // Global or user-specific
      .slice(-limit)
      .reverse();
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId) {
    const notification = this.notificationHistory.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
  }

  /**
   * Clear all notifications for user
   */
  clearNotifications(userId) {
    this.notificationHistory = this.notificationHistory.filter(
      n => n.userId !== userId
    );
  }

  /**
   * Internal: Send push notification (implement with service like Firebase)
   */
  _sendPushNotification(userId, notification) {
    // TODO: Implement push notification service
    // This could use Firebase Cloud Messaging, OneSignal, etc.
    console.log(`Push notification to ${userId}:`, notification.message);
  }

  /**
   * Internal: Get icon for facility type
   */
  _getIcon(type) {
    const icons = {
      food: '🍽️',
      washroom: '🚻',
      restroom: '🪑',
      parking: '🅿️',
      medical: '🏥',
      info: 'ℹ️'
    };
    return icons[type] || '📍';
  }
}

module.exports = NotificationService;
