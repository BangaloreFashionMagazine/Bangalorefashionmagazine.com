import { useState, useRef, useCallback } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { X, Check, RotateCcw } from 'lucide-react';

const ImageCropper = ({ imageSrc, onCropComplete, onCancel, aspectRatio }) => {
  const [crop, setCrop] = useState({ unit: '%', width: 80, height: 80, x: 10, y: 10 });
  const [completedCrop, setCompletedCrop] = useState(null);
  const imgRef = useRef(null);

  const onImageLoad = useCallback((e) => {
    imgRef.current = e.currentTarget;
    const { width, height } = e.currentTarget;
    
    // Set initial crop based on aspect ratio or default to center
    const cropWidth = aspectRatio ? Math.min(80, (height / width) * 80 * aspectRatio) : 80;
    const cropHeight = aspectRatio ? cropWidth / aspectRatio : 80;
    
    setCrop({
      unit: '%',
      width: cropWidth,
      height: cropHeight,
      x: (100 - cropWidth) / 2,
      y: (100 - cropHeight) / 2,
    });
  }, [aspectRatio]);

  const getCroppedImage = useCallback(() => {
    if (!completedCrop || !imgRef.current) return;

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
          onCropComplete(reader.result);
        };
        reader.readAsDataURL(blob);
      }
    }, 'image/jpeg', 0.9);
  }, [completedCrop, onCropComplete]);

  const resetCrop = () => {
    setCrop({ unit: '%', width: 80, height: 80, x: 10, y: 10 });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-4">
      <div className="bg-[#0A1628] rounded-xl p-4 max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[#D4AF37] font-serif text-lg">Crop Image</h3>
          <div className="flex gap-2">
            <button onClick={resetCrop} className="p-2 bg-[#050A14] rounded text-[#A0A5B0] hover:text-[#F5F5F0]" title="Reset">
              <RotateCcw size={20} />
            </button>
            <button onClick={onCancel} className="p-2 bg-red-500/20 rounded text-red-500 hover:bg-red-500 hover:text-white" title="Cancel">
              <X size={20} />
            </button>
            <button onClick={getCroppedImage} className="p-2 bg-green-500/20 rounded text-green-500 hover:bg-green-500 hover:text-white" title="Apply Crop">
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
          Drag to adjust crop area, then click ✓ to apply
        </p>
      </div>
    </div>
  );
};

export default ImageCropper;
