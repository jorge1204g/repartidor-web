import { useEffect } from 'react';
import AudioNotificationService from '../utils/AudioNotificationService';

const GlobalNotificationHandler: React.FC = () => {
  useEffect(() => {
    // Función para habilitar el contexto de audio en la primera interacción del usuario
    const enableAudioOnInteraction = () => {
      AudioNotificationService.enableAudio();
      
      // Remover los event listeners después de la primera interacción
      document.removeEventListener('click', enableAudioOnInteraction);
      document.removeEventListener('touchstart', enableAudioOnInteraction);
    };

    // Agregar event listeners para habilitar el audio en la primera interacción
    document.addEventListener('click', enableAudioOnInteraction);
    document.addEventListener('touchstart', enableAudioOnInteraction);

    // También intentar habilitar el audio cuando el componente se monta
    // Esto puede funcionar si la página ya tiene permiso para reproducir audio
    AudioNotificationService.enableAudio();

    // Cleanup: remover event listeners cuando el componente se desmonta
    return () => {
      document.removeEventListener('click', enableAudioOnInteraction);
      document.removeEventListener('touchstart', enableAudioOnInteraction);
    };
  }, []);

  return null; // Este componente no renderiza nada visualmente
};

export default GlobalNotificationHandler;