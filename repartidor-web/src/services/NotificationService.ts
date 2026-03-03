import AudioNotificationService from '../utils/AudioNotificationService';

class NotificationService {
  private static instance: NotificationService;
  private audioService = AudioNotificationService;
  
  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  public showNotification(title: string, body: string, icon?: string): void {
    // Primero intentamos mostrar una notificación del navegador si es posible
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(title, {
          body: body,
          icon: icon || '/favicon.ico',
          tag: 'delivery-app-notification'
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification(title, {
              body: body,
              icon: icon || '/favicon.ico',
              tag: 'delivery-app-notification'
            });
          }
        });
      }
    }
    
    // Si la notificación del navegador no es posible, usamos notificaciones dentro de la app
    this.showInAppNotification(title, body);
  }

  private showInAppNotification(title: string, body: string): void {
    // Creamos una notificación simple en la interfaz si no se puede usar la API de notificaciones
    console.log(`Notificación: ${title} - ${body}`);
  }

  public playOrderAssignedSound(): void {
    this.audioService.playOrderAssignedSound();
  }

  public playMessageReceivedSound(): void {
    this.audioService.playMessageReceivedSound();
  }
}

export default NotificationService.getInstance();