import { database, ref, onValue, set, get, child, update as firebaseUpdate } from './Firebase';
import { push as firebasePush } from 'firebase/database';

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
}

interface MessageServiceResponse {
  success: boolean;
  message: string;
  data?: any;
}

class MessageService {
  // Método para enviar un mensaje
  async sendMessage(
    senderId: string,
    senderName: string,
    receiverId: string,
    receiverName: string,
    message: string,
    messageType: string = 'TEXT'
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
        messageType
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
        callback(sortedMessages);
      } else {
        callback([]);
      }
    }, (error) => {
      console.error('Error observando mensajes:', error);
      callback([]);
    });
    
    // Devolver función para cancelar la suscripción
    return unsubscribe;
  }

  // Método para marcar un mensaje como leído
  async markMessageAsRead(messageId: string): Promise<MessageServiceResponse> {
    try {
      console.log('Marcando mensaje como leído:', messageId);
      
      await firebaseUpdate(ref(database), {
        [`messages/${messageId}/isRead`]: true
      });
      
      return {
        success: true,
        message: 'Mensaje marcado como leído'
      };
    } catch (error: any) {
      console.error('Error marcando mensaje como leído:', error);
      return {
        success: false,
        message: error.message || 'Error al marcar el mensaje como leído'
      };
    }
  }

  // Método para obtener mensajes no leídos para un usuario
  async getUnreadMessagesForUser(userId: string): Promise<Message[]> {
    try {
      console.log('Obteniendo mensajes no leídos para:', userId);
      
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
        
        // Filtrar mensajes dirigidos al usuario que no han sido leídos
        if (message.receiverId === userId && !message.isRead) {
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
      console.error('Error obteniendo mensajes no leídos:', error);
      return [];
    }
  }
}

export default new MessageService();