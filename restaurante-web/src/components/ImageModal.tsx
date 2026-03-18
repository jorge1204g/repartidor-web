import React from 'react';

interface ImageModalProps {
  images: string[];
  currentIndex: number | null;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onDownload: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({
  images,
  currentIndex,
  onClose,
  onNext,
  onPrevious,
  onDownload
}) => {
  // Si currentIndex es null, no renderizar
  if (currentIndex === null) {
    return null;
  }

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '2rem'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          position: 'relative',
          maxWidth: '90%',
          maxHeight: '90%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '-40px',
            right: '0',
            backgroundColor: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            fontSize: '24px',
            fontWeight: 'bold',
            cursor: 'pointer',
            color: '#333',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ✕
        </button>

        {/* Imagen */}
        <img
          src={images[currentIndex]}
          alt={`Vista completa ${currentIndex + 1}`}
          style={{
            maxWidth: '100%',
            maxHeight: '80vh',
            objectFit: 'contain',
            borderRadius: '0.5rem'
          }}
        />

        {/* Información */}
        <div style={{
          marginTop: '1rem',
          color: 'white',
          fontSize: '1rem',
          fontWeight: '600'
        }}>
          Imagen {currentIndex + 1} de {images.length}
        </div>

        {/* Botones de navegación */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginTop: '1rem'
        }}>
          <button
            onClick={onPrevious}
            disabled={currentIndex === 0}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: currentIndex === 0 ? '#6b7280' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: '600',
              cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
              opacity: currentIndex === 0 ? 0.5 : 1
            }}
          >
            ← Anterior
          </button>
          
          <button
            onClick={onDownload}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            ⬇️ Descargar
          </button>
          
          <button
            onClick={onNext}
            disabled={currentIndex === images.length - 1}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: currentIndex === images.length - 1 ? '#6b7280' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: '600',
              cursor: currentIndex === images.length - 1 ? 'not-allowed' : 'pointer',
              opacity: currentIndex === images.length - 1 ? 0.5 : 1
            }}
          >
            Siguiente →
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
