// Servicio para reproducir sonidos de notificación
class AudioNotificationService {
  private static instance: AudioNotificationService;
  private audioContext: AudioContext | null = null;
  
  // Sonidos predefinidos
  private sounds = {
    orderAssigned: new Audio(), // Se inicializará con un tono generado
    messageReceived: new Audio() // Se inicializará con un tono diferente
  };

  private constructor() {
    // Inicializar el contexto de audio de forma segura
    this.initializeAudioContext();
    this.initializeSounds();
  }

  private initializeAudioContext() {
    try {
      // Verificar si el navegador soporta AudioContext
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioContext();
      
      // Suspender el contexto inicialmente hasta que el usuario interactúe
      if (this.audioContext.state === 'suspended') {
        document.addEventListener('click', () => this.enableAudio(), { once: true });
        document.addEventListener('touchstart', () => this.enableAudio(), { once: true });
      }
    } catch (e) {
      console.warn('Web Audio API no soportado en este navegador:', e);
      // Si no se puede crear el contexto de audio, usar alternativas
      this.setupFallbackSounds();
    }
  }

  private setupFallbackSounds() {
    // Preparar archivos de sonido como respaldo
    try {
      // Intentar cargar archivos de sonido reales
      this.sounds.orderAssigned.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAAAAAAA=';
      this.sounds.messageReceived.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAAAAAAA=';
    } catch (e) {
      console.warn('No se pudieron configurar los sonidos de respaldo:', e);
    }
  }

  public static getInstance(): AudioNotificationService {
    if (!AudioNotificationService.instance) {
      AudioNotificationService.instance = new AudioNotificationService();
    }
    return AudioNotificationService.instance;
  }

  private initializeSounds() {
    // Inicializar sonido para pedido asignado (tono más corto)
    this.generateTone(this.sounds.orderAssigned, 800, 0.2, 'sine', 200);
    
    // Inicializar sonido para mensaje recibido (tono más largo o diferente)
    this.generateTone(this.sounds.messageReceived, 600, 0.3, 'square', 400);
  }

  private generateTone(audioElement: HTMLAudioElement, frequency: number, duration: number, type: OscillatorType, endTime: number) {
    try {
      const audioContext = this.audioContext;
      if (!audioContext) return;

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.type = type;
      oscillator.frequency.value = frequency;

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
      
      // Convertir el sonido generado a un blob para poder reproducirlo como audio
      // (esto es una aproximación, ya que no podemos capturar directamente el audio generado)
    } catch (e) {
      console.warn('No se pudo inicializar el contexto de audio:', e);
    }
  }

  // Reproducir sonido de pedido asignado
  public playOrderAssignedSound() {
    this.playSound(this.sounds.orderAssigned, 'orderAssigned');
  }

  // Reproducir sonido de mensaje recibido
  public playMessageReceivedSound() {
    this.playSound(this.sounds.messageReceived, 'messageReceived');
  }

  private playSound(audioElement: HTMLAudioElement, soundType: 'orderAssigned' | 'messageReceived') {
    // Intentar usar un archivo de sonido local o un tono generado
    try {
      // Si ya hay un audio reproduciéndose, detenerlo
      if (audioElement.currentTime > 0) {
        audioElement.currentTime = 0;
      }
      
      // Reproducir el sonido
      audioElement.play().catch(e => {
        console.warn('No se pudo reproducir el sonido:', e);
        // Como alternativa, intentar generar un tono con Web Audio API
        this.fallbackPlaySound(soundType);
      });
    } catch (e) {
      console.warn('Error al reproducir sonido:', e);
      
      // Como alternativa, intentar generar un tono con Web Audio API
      this.fallbackPlaySound(soundType);
    }
  }

  private fallbackPlaySound(soundType: 'orderAssigned' | 'messageReceived') {
    try {
      const audioContext = this.audioContext;
      if (!audioContext) return;

      // Resumir el contexto de audio si está suspendido
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Configurar frecuencia y tipo según el tipo de sonido
      if (soundType === 'orderAssigned') {
        oscillator.frequency.value = 800; // Tono más alto para pedido
        oscillator.type = 'sine';
      } else {
        oscillator.frequency.value = 600; // Tono más bajo para mensaje
        oscillator.type = 'square';
      }

      // Configurar volumen y duración
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (e) {
      console.warn('No se pudo reproducir el tono de fallback:', e);
    }
  }

  // Permitir al usuario inicializar el contexto de audio si es necesario (para navegadores modernos)
  public async enableAudio() {
    if (this.audioContext?.state === 'suspended') {
      try {
        await this.audioContext.resume();
        console.log('Contexto de audio habilitado');
      } catch (e) {
        console.error('Error al habilitar el contexto de audio:', e);
      }
    }
  }
}

export default AudioNotificationService.getInstance();