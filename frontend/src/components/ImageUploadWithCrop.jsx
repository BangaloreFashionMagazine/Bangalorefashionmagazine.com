import { useState, useRef, useCallback } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { X, Check, RotateCcw, Upload } from 'lucide-react';

const ImageUploadWithCrop = ({ onImageSelect, aspectRatio, buttonText = "Choose Image", className = "" }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ unit: '%', width: 80, height: 80, x: 10, y: 10 });
  const [completedCrop, setCompletedCrop] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const imgRef = useRef(null);
  const inputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageSrc(reader.result);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const onImageLoad = useCallback((e) => {
    imgRef.current = e.currentTarget;
    const { width, height } = e.currentTarget;
    
    let cropWidth = 80, cropHeight = 80;
    if (aspectRatio) {
      const imgAspect = width / height;
      if (imgAspect > aspectRatio) {
        cropHeight = 80;
        cropWidth = (cropHeight * aspectRatio * height) / width;
      } else {
        cropWidth = 80;
        cropHeight = (cropWidth / aspectRatio * width) / height;
      }
    }
    
    setCrop({
      unit: '%',
      width: Math.min(cropWidth, 90),
      height: Math.min(cropHeight, 90),
      x: (100 - Math.min(cropWidth, 90)) / 2,
      y: (100 - Math.min(cropHeight, 90)) / 2,
    });
  }, [aspectRatio]);

  const getCroppedImage = useCallback(() => {
    if (!completedCrop || !imgRef.current) {
      // If no crop made, use original image
      onImageSelect(imageSrc);
      setShowCropper(false);
      setImageSrc(null);
      return;
    }

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob((blob) => {
      if (blob) {
        const reader = new FileReader();
        reader.onloadend = () => {
          onImageSelect(reader.result);
          setShowCropper(false);
          setImageSrc(null);
        };
        reader.readAsDataURL(blob);
      }
    }, 'image/jpeg', 0.9);
  }, [completedCrop, imageSrc, onImageSelect]);

  const cancelCrop = () => {
    setShowCropper(false);
    setImageSrc(null);
  };

  const useOriginal = () => {
    onImageSelect(imageSrc);
    setShowCropper(false);
    setImageSrc(null);
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`flex items-center gap-2 px-4 py-2 bg-[#D4AF37]/20 text-[#D4AF37] rounded hover:bg-[#D4AF37] hover:text-[#050A14] transition-all ${className}`}
      >
        <Upload size={16} />
        {buttonText}
      </button>

      {showCropper && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-4">
          <div className="bg-[#0A1628] rounded-xl p-4 max-w-4xl w-full max-h-[90vh] overflow-auto border border-[#D4AF37]/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[#D4AF37] font-serif text-lg">Crop Image</h3>
              <div className="flex gap-2">
                <button 
                  onClick={useOriginal} 
                  className="px-3 py-1.5 bg-[#050A14] rounded text-[#A0A5B0] hover:text-[#F5F5F0] text-sm"
                >
                  Use Original
                </button>
                <button 
                  onClick={cancelCrop} 
                  className="p-2 bg-red-500/20 rounded text-red-500 hover:bg-red-500 hover:text-white" 
                  title="Cancel"
                >
                  <X size={20} />
                </button>
                <button 
                  onClick={getCroppedImage} 
                  className="p-2 bg-green-500/20 rounded text-green-500 hover:bg-green-500 hover:text-white" 
                  title="Apply Crop"
                >
                  <Check size={20} />
                </button>
              </div>
            </div>
            
            <div className="flex justify-center bg-[#050A14] rounded-lg p-2">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspectRatio}
              >
                <img
                  src={imageSrc}
                  onLoad={onImageLoad}
                  alt="Crop preview"
                  style={{ maxHeight: '60vh', maxWidth: '100%' }}
                />
              </ReactCrop>
            </div>
            
            <p className="text-[#A0A5B0] text-sm text-center mt-4">
              Drag to adjust crop area, then click ✓ to apply or "Use Original" to skip cropping
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default ImageUploadWithCrop;
