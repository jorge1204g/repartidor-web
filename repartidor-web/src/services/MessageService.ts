import { database, ref, onValue, set, get, child, update } from './Firebase';
import { push as firebasePush } from 'firebase/database';
import AudioNotificationService from '../utils/AudioNotificationService';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  message: string;
  timestamp: number;
  isRead: boolean;
  messageType: string;
  orderId?: string;
  isArchived?: boolean;
  imageUrl?: string; // URL de la imagen si messageType es 'IMAGE'
}

interface MessageServiceResponse {
  success: boolean;
  message: string;
  data?: any;
}

class MessageService {
  private previousMessages: Map<string, Message[]> = new Map();
  private lastMessageCount: Map<string, number> = new Map();

  // Método para enviar un mensaje
  async sendMessage(
    senderId: string,
    senderName: string,
    receiverId: string,
    receiverName: string,
    message: string,
    messageType: string = 'TEXT',
    orderId?: string,
    imageUrl?: string
  ): Promise<MessageServiceResponse> {
    try {
      console.log('Enviando mensaje de:', senderId, 'a:', receiverId);
      
      // Crear una referencia para generar un nuevo ID único
      const newMessageRef = firebasePush(ref(database, 'messages'));
      const messageId = newMessageRef.key;
      
      if (!messageId) {
        throw new Error('No se pudo generar un ID para el mensaje');
      }
      
      // Crear el objeto del mensaje
      const messageObject: Message = {
        id: messageId,
        senderId,
        senderName,
        receiverId,
        receiverName,
        message,
        timestamp: Date.now(),
        isRead: false,
        messageType,
        orderId,
        imageUrl
      };
      
      // Guardar el mensaje en Firebase
      await set(newMessageRef, messageObject);
      
      return {
        success: true,
        message: 'Mensaje enviado exitosamente'
      };
    } catch (error: any) {
      console.error('Error enviando mensaje:', error);
      return {
        success: false,
        message: error.message || 'Error al enviar el mensaje'
      };
    }
  }

  // Método para enviar una imagen
  async sendImage(
    senderId: string,
    senderName: string,
    receiverId: string,
    receiverName: string,
    imageBase64: string,
    orderId?: string
  ): Promise<MessageServiceResponse> {
    try {
      console.log('Enviando imagen de:', senderId, 'a:', receiverId);
      
      // Crear una referencia para generar un nuevo ID único
      const newMessageRef = firebasePush(ref(database, 'messages'));
      const messageId = newMessageRef.key;
      
      if (!messageId) {
        throw new Error('No se pudo generar un ID para la imagen');
      }
      
      // Crear el objeto del mensaje con la imagen
      const messageObject: Message = {
        id: messageId,
        senderId,
        senderName,
        receiverId,
        receiverName,
        message: '📷 Imagen enviada',
        timestamp: Date.now(),
        isRead: false,
        messageType: 'IMAGE',
        orderId,
        imageUrl: imageBase64
      };
      
      // Guardar el mensaje en Firebase
      await set(newMessageRef, messageObject);
      
      return {
        success: true,
        message: 'Imagen enviada exitosamente'
      };
    } catch (error: any) {
      console.error('Error enviando imagen:', error);
      return {
        success: false,
        message: error.message || 'Error al enviar la imagen'
      };
    }
  }

  // Método para obtener últimos mensajes de todas las conversaciones CON NOTIFICACIÓN
  observeLastMessages(userId: string, callback: (messages: Message[]) => void) {
    const messagesRef = ref(database, 'messages');
    
    onValue(messagesRef, (snapshot) => {
      if (snapshot.exists()) {
        const allMessages = snapshot.val();
        const userMessages: Message[] = [];
        const conversationMap = new Map<string, Message>();
        
        // Obtener último mensaje de cada conversación
        for (const messageId in allMessages) {
          const msg = allMessages[messageId];
          
          if (msg.senderId === userId || msg.receiverId === userId) {
            const otherUserId = msg.senderId === userId ? msg.receiverId : msg.senderId;
            
            // Mantener solo el mensaje más reciente de cada conversación
            if (!conversationMap.has(otherUserId) || 
                msg.timestamp > conversationMap.get(otherUserId)!.timestamp) {
              conversationMap.set(otherUserId, {
                id: messageId,
                senderId: msg.senderId || '',
                senderName: msg.senderName || '',
                receiverId: msg.receiverId || '',
                receiverName: msg.receiverName || '',
                message: msg.message || '',
                timestamp: msg.timestamp || Date.now(),
                isRead: msg.isRead || false,
                messageType: msg.messageType || 'TEXT'
              });
            }
          }
        }
        
        // Convertir map a array y ordenar por timestamp
        conversationMap.forEach(msg => userMessages.push(msg));
        userMessages.sort((a, b) => b.timestamp - a.timestamp);
        
        // VERIFICAR SI HAY MENSAJES NUEVOS PARA NOTIFICAR
        const previousCount = this.lastMessageCount.get(userId) || 0;
        const currentUnreadCount = userMessages.filter(
          msg => msg.receiverId === userId && !msg.isRead
        ).length;
        
        if (currentUnreadCount > previousCount) {
          // ¡Hay mensajes nuevos! Reproducir sonido
          AudioNotificationService.playMessageReceivedSound();
          console.log('🔔 ¡Nuevo mensaje recibido!');
        }
        
        this.lastMessageCount.set(userId, currentUnreadCount);
        
        callback(userMessages);
      } else {
        callback([]);
      }
    });
  }

  // Método para obtener mensajes entre dos usuarios
  async getMessagesBetweenUsers(userId1: string, userId2: string): Promise<Message[]> {
    try {
      console.log('Obteniendo mensajes entre:', userId1, 'y', userId2);
      
      // Consultar todos los mensajes en la base de datos
      const dbRef = ref(database);
      const snapshot = await get(child(dbRef, 'messages'));

      if (!snapshot.exists()) {
        return [];
      }

      const allMessages = snapshot.val();
      const messagesArray: Message[] = [];

      for (const messageId in allMessages) {
        const message = allMessages[messageId];
        
        // Filtrar mensajes entre los dos usuarios
        if (
          (message.senderId === userId1 && message.receiverId === userId2) ||
          (message.senderId === userId2 && message.receiverId === userId1)
        ) {
          // Asegurar que todos los campos requeridos estén presentes
          const messageObj: Message = {
            id: messageId,
            senderId: message.senderId || '',
            senderName: message.senderName || '',
            receiverId: message.receiverId || '',
            receiverName: message.receiverName || '',
            message: message.message || '',
            timestamp: message.timestamp || Date.now(),
            isRead: message.isRead || false,
            messageType: message.messageType || 'TEXT'
          };
          
          messagesArray.push(messageObj);
        }
      }

      // Ordenar por timestamp (más recientes últimos)
      return messagesArray.sort((a, b) => a.timestamp - b.timestamp);
    } catch (error) {
      console.error('Error obteniendo mensajes:', error);
      return [];
    }
  }

  // Método para observar mensajes en tiempo real entre dos usuarios
  observeMessagesBetweenUsers(
    userId1: string,
    userId2: string,
    callback: (messages: Message[]) => void
  ): () => void {
    console.log('Observando mensajes entre:', userId1, 'y', userId2);
    
    // Crear una clave única para este par de usuarios
    const conversationKey = `${userId1}-${userId2}`;
    
    // Crear una referencia a la base de datos de mensajes
    const messagesRef = ref(database, 'messages');
    
    // Configurar listener en tiempo real
    const unsubscribe = onValue(messagesRef, async (snapshot) => {
      if (snapshot.exists()) {
        const allMessages = snapshot.val();
        const messagesArray: Message[] = [];

        for (const messageId in allMessages) {
          const message = allMessages[messageId];
          
          // Filtrar mensajes entre los dos usuarios
          if (
            (message.senderId === userId1 && message.receiverId === userId2) ||
            (message.senderId === userId2 && message.receiverId === userId1)
          ) {
            // Asegurar que todos los campos requeridos estén presentes
            const messageObj: Message = {
              id: messageId,
              senderId: message.senderId || '',
              senderName: message.senderName || '',
              receiverId: message.receiverId || '',
              receiverName: message.receiverName || '',
              message: message.message || '',
              timestamp: message.timestamp || Date.now(),
              isRead: message.isRead || false,
              messageType: message.messageType || 'TEXT'
            };
            
            messagesArray.push(messageObj);
          }
        }

        // Ordenar por timestamp (más recientes últimos)
        const sortedMessages = messagesArray.sort((a, b) => a.timestamp - b.timestamp);
        
        // MARCAR COMO LEÍDOS AUTOMÁTICAMENTE
        const unreadIncomingMessages = sortedMessages.filter(
          msg => msg.receiverId === userId1 && !msg.isRead
        );
        
        for (const msg of unreadIncomingMessages) {
          await this.markMessageAsRead(msg.id);
        }
        
        callback(sortedMessages);
      } else {
        callback([]);
      }
    });

    // Guardar referencia para limpieza
    this.previousMessages.set(conversationKey, []);

    // Retornar función de cleanup
    return () => {
      unsubscribe();
      this.previousMessages.delete(conversationKey);
    };
  }

  // Método para marcar mensaje como leído
  async markMessageAsRead(messageId: string): Promise<boolean> {
    try {
      const messageRef = ref(database, `messages/${messageId}`);
      await update(messageRef, {
        isRead: true
      });
      return true;
    } catch (error) {
      console.error('Error marcando mensaje como leído:', error);
      return false;
    }
  }

  // Método para obtener mensajes no leídos para un usuario
  async getUnreadMessagesForUser(userId: string): Promise<Message[]> {
    try {
      const dbRef = ref(database);
      const snapshot = await get(child(dbRef, 'messages'));

      if (!snapshot.exists()) {
        return [];
      }

      const allMessages = snapshot.val();
      const unreadMessages: Message[] = [];

      for (const messageId in allMessages) {
        const message = allMessages[messageId];
        
        // Verificar si el mensaje es para este usuario y no ha sido leído
        if (message.receiverId === userId && !message.isRead) {
          const messageObj: Message = {
            id: messageId,
            senderId: message.senderId || '',
            senderName: message.senderName || '',
            receiverId: message.receiverId || '',
            receiverName: message.receiverName || '',
            message: message.message || '',
            timestamp: message.timestamp || Date.now(),
            isRead: message.isRead || false,
            messageType: message.messageType || 'TEXT'
          };
          
          unreadMessages.push(messageObj);
        }
      }

      // Ordenar por timestamp (más recientes últimos)
      return unreadMessages.sort((a, b) => a.timestamp - b.timestamp);
    } catch (error) {
      console.error('Error obteniendo mensajes no leídos:', error);
      return [];
    }
  }

  // Método para contar mensajes no leídos para un usuario
  async countUnreadMessagesForUser(userId: string): Promise<number> {
    try {
      const unreadMessages = await this.getUnreadMessagesForUser(userId);
      return unreadMessages.length;
    } catch (error) {
      console.error('Error contando mensajes no leídos:', error);
      return 0;
    }
  }

  // Método para buscar conversaciones por nombre de cliente
  searchConversationsByClientName(
    conversations: any[],
    searchTerm: string
  ): any[] {
    if (!searchTerm.trim()) {
      return conversations;
    }
    
    const term = searchTerm.toLowerCase().trim();
    return conversations.filter(conv => 
      conv.clientName.toLowerCase().includes(term) ||
      conv.orderCode?.toLowerCase().includes(term)
    );
  }

  // Método para archivar conversación (marcar como finalizada)
  async archiveConversation(
    userId: string,
    clientId: string,
    orderId: string
  ): Promise<boolean> {
    try {
      // Obtener todos los mensajes de esta conversación
      const messages = await this.getMessagesBetweenUsers(userId, clientId);
      
      // Marcar todos como archivados
      for (const msg of messages) {
        if (msg.orderId === orderId) {
          await update(ref(database, `messages/${msg.id}`), {
            isArchived: true
          });
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error archivando conversación:', error);
      return false;
    }
  }

  // Método para obtener conversaciones activas (no archivadas)
  observeActiveConversations(userId: string, callback: (conversations: any[]) => void) {
    const messagesRef = ref(database, 'messages');
    
    onValue(messagesRef, (snapshot) => {
      if (snapshot.exists()) {
        const allMessages = snapshot.val();
        const activeConversations = new Map<string, any>();
        
        for (const messageId in allMessages) {
          const msg = allMessages[messageId];
          
          if ((msg.senderId === userId || msg.receiverId === userId) && 
              !msg.isArchived) {
            const otherUserId = msg.senderId === userId ? msg.receiverId : msg.senderId;
            
            if (!activeConversations.has(otherUserId)) {
              activeConversations.set(otherUserId, {
                clientId: otherUserId,
                clientName: msg.senderId === userId ? msg.receiverName : msg.senderName,
                orderId: msg.orderId || '',
                lastMessage: msg.message,
                lastMessageTime: msg.timestamp,
                unreadCount: 0
              });
            } else {
              const existing = activeConversations.get(otherUserId)!;
              if (msg.timestamp > existing.lastMessageTime) {
                activeConversations.set(otherUserId, {
                  ...existing,
                  lastMessage: msg.message,
                  lastMessageTime: msg.timestamp,
                  unreadCount: existing.unreadCount + (msg.receiverId === userId && !msg.isRead ? 1 : 0)
                });
              }
            }
          }
        }
        
        const convArray = Array.from(activeConversations.values());
        convArray.sort((a, b) => b.lastMessageTime - a.lastMessageTime);
        
        callback(convArray);
      } else {
        callback([]);
      }
    });
  }

  // Método para marcar mensajes como leídos
  async markMessagesAsRead(senderId: string, receiverId: string): Promise<MessageServiceResponse> {
    try {
      const messagesRef = ref(database, 'messages');
      const snapshot = await get(messagesRef);
      
      if (!snapshot.exists()) {
        return { success: true, message: 'No hay mensajes' };
      }

      const updates: any = {};
      let updatedCount = 0;

      for (const messageId in snapshot.val()) {
        const msg = snapshot.val()[messageId];
        if (msg.senderId === senderId && msg.receiverId === receiverId && !msg.isRead) {
          updates[`messages/${messageId}/isRead`] = true;
          updatedCount++;
        }
      }

      if (updatedCount > 0) {
        await update(messagesRef, updates);
        console.log(`✅ ${updatedCount} mensajes marcados como leídos`);
      }

      return { success: true, message: `${updatedCount} mensajes actualizados` };
    } catch (error: any) {
      console.error('Error al marcar mensajes como leídos:', error);
      return { success: false, message: error.message };
    }
  }
}

export default new MessageService();
