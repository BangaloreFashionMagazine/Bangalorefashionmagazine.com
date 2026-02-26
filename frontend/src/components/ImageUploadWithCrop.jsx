import { useState, useRef, useCallback } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { X, Check, Upload } from 'lucide-react';
import { autoCompressImage, getBase64Size } from '@/lib/imageOptimization';

const ImageUploadWithCrop = ({ onImageSelect, aspectRatio, buttonText = "Choose Image", className = "", maxSizeKB = 500 }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ unit: '%', width: 80, height: 80, x: 10, y: 10 });
  const [completedCrop, setCompletedCrop] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
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

  const compressAndReturn = async (base64Image) => {
    setIsCompressing(true);
    try {
      const originalSize = getBase64Size(base64Image);
      const compressed = await autoCompressImage(base64Image, maxSizeKB);
      const newSize = getBase64Size(compressed);
      if (originalSize > newSize) {
        console.log(`Image optimized: ${originalSize}KB → ${newSize}KB`);
      }
      onImageSelect(compressed);
    } catch (err) {
      console.error('Compression failed, using original:', err);
      onImageSelect(base64Image);
    }
    setIsCompressing(false);
    setShowCropper(false);
    setImageSrc(null);
  };

  const getCroppedImage = useCallback(async () => {
    if (!completedCrop || !imgRef.current) {
      await compressAndReturn(imageSrc);
      return;
    }

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    // Limit canvas size for optimization
    const maxDim = 1200;
    let canvasWidth = completedCrop.width * scaleX;
    let canvasHeight = completedCrop.height * scaleY;
    
    if (canvasWidth > maxDim || canvasHeight > maxDim) {
      const ratio = Math.min(maxDim / canvasWidth, maxDim / canvasHeight);
      canvasWidth *= ratio;
      canvasHeight *= ratio;
    }
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      canvasWidth,
      canvasHeight
    );

    // Use JPEG at 80% quality for smaller file size
    const croppedBase64 = canvas.toDataURL('image/jpeg', 0.8);
    await compressAndReturn(croppedBase64);
  }, [completedCrop, imageSrc, onImageSelect, maxSizeKB]);

  const cancelCrop = () => {
    setShowCropper(false);
    setImageSrc(null);
  };

  const useOriginal = async () => {
    await compressAndReturn(imageSrc);
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
                  disabled={isCompressing}
                  className="px-3 py-1.5 bg-[#050A14] rounded text-[#A0A5B0] hover:text-[#F5F5F0] text-sm disabled:opacity-50"
                >
                  {isCompressing ? 'Optimizing...' : 'Use Original'}
                </button>
                <button 
                  onClick={cancelCrop}
                  disabled={isCompressing}
                  className="p-2 bg-red-500/20 rounded text-red-500 hover:bg-red-500 hover:text-white disabled:opacity-50" 
                  title="Cancel"
                >
                  <X size={20} />
                </button>
                <button 
                  onClick={getCroppedImage}
                  disabled={isCompressing}
                  className="p-2 bg-green-500/20 rounded text-green-500 hover:bg-green-500 hover:text-white disabled:opacity-50" 
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
              {isCompressing ? 'Optimizing image...' : 'Drag to adjust crop area, then click ✓ to apply. Images are auto-optimized for faster loading.'}
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default ImageUploadWithCrop;
