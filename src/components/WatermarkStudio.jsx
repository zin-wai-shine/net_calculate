import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Select from 'react-select';
import { ArrowLeft, Upload, Download, Type, Image as ImageIcon, Move, Sparkles, Trash2, Grid, RotateCw } from 'lucide-react';

const PRESET_COLORS = [
  '#ffffff', // White
  '#000000', // Black
  '#f56565', // Red
  '#f6e05e', // Yellow
  '#48bb78', // Green
  '#4299e1', // Blue
  '#ed64a6', // Pink
  '#a855f7'  // Purple
];

const FONTS = [
  { value: 'Olivia', label: 'Olivia (Elegant Calligraphy)' },
  { value: 'Montserrat', label: 'Montserrat (Modern Sans)' },
  { value: 'Playfair Display', label: 'Playfair Display (Elegant Serif)' },
  { value: 'Pacifico', label: 'Pacifico (Retro Cursive)' },
  { value: 'Outfit', label: 'Outfit (Clean Geometric)' },
  { value: 'Caveat', label: 'Caveat (Handwritten)' },
  { value: 'Impact', label: 'Impact (Bold)' },
  { value: 'Courier New', label: 'Courier New (Monospace)' },
  { value: 'sans-serif', label: 'Default Sans-serif' }
];

const selectStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: 'var(--input-bg)',
    borderColor: state.isFocused ? 'var(--input-focus-border)' : 'var(--input-border)',
    boxShadow: state.isFocused ? 'var(--input-focus-shadow)' : 'none',
    borderRadius: '8px',
    fontFamily: 'inherit',
    fontSize: '0.9rem',
    fontWeight: '500',
    color: 'var(--text-primary)',
    padding: '0 0.2rem',
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    cursor: 'pointer',
    height: '44px',
    minHeight: '44px',
    display: 'flex',
    alignItems: 'center',
    '&:hover': {
      borderColor: state.isFocused ? 'var(--input-focus-border)' : 'var(--input-border)',
    }
  }),
  valueContainer: (provided) => ({
    ...provided,
    height: '42px',
    padding: '0 6px',
    display: 'flex',
    alignItems: 'center'
  }),
  indicatorsContainer: (provided) => ({
    ...provided,
    height: '42px',
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: 'var(--dropdown-bg)',
    border: '1px solid var(--card-border)',
    borderRadius: '8px',
    boxShadow: 'var(--card-shadow)',
    backdropFilter: 'blur(20px)',
    overflow: 'hidden',
    zIndex: 1050
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected 
      ? 'var(--accent-color)' 
      : state.isFocused 
        ? 'var(--formula-badge-bg)'
        : 'transparent',
    color: state.isSelected 
      ? 'var(--btn-primary-text)' 
      : 'var(--text-primary)',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: state.isSelected ? '600' : '500',
    fontFamily: state.data.value === 'sans-serif' ? 'sans-serif' : state.data.value,
    padding: '0.65rem 1rem',
    '&:active': {
      backgroundColor: 'var(--text-primary)',
    }
  }),
  singleValue: (provided, state) => ({
    ...provided,
    color: 'var(--text-primary)',
    fontWeight: '500',
    fontFamily: state.data.value === 'sans-serif' ? 'sans-serif' : state.data.value
  }),
  input: (provided) => ({
    ...provided,
    color: 'var(--text-primary)',
    margin: '0px'
  }),
  placeholder: (provided) => ({
    ...provided,
    color: 'var(--text-muted)'
  }),
  dropdownIndicator: (provided) => ({
    ...provided,
    color: 'var(--text-secondary)',
    '&:hover': {
      color: 'var(--text-primary)'
    }
  }),
  indicatorSeparator: () => ({
    display: 'none'
  })
};

const WatermarkStudio = ({ onBack }) => {
  // Load Google Fonts for beautiful typography options
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&family=Playfair+Display:ital,wght@0,700;1,400&family=Pacifico&family=Outfit:wght@400;700&family=Caveat:wght@700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, []);

  // Watermark General Config
  const [wmType, setWmType] = useState(() => {
    return localStorage.getItem('net_calc_wm_type') || 'text';
  });

  // Text Config States
  const [text, setText] = useState(() => {
    return localStorage.getItem('net_calc_wm_text') || 'Net Calculate';
  });
  const [fontFamily, setFontFamily] = useState(() => {
    return localStorage.getItem('net_calc_wm_font') || 'Olivia';
  });
  const [color, setColor] = useState(() => {
    return localStorage.getItem('net_calc_wm_color') || '#ffffff';
  });
  const [size, setSize] = useState(() => {
    const saved = localStorage.getItem('net_calc_wm_size');
    return saved ? parseInt(saved, 10) : 32;
  });
  const [opacity, setOpacity] = useState(() => {
    const saved = localStorage.getItem('net_calc_wm_opacity');
    return saved ? parseFloat(saved) : 0.6;
  });
  const [isBold, setIsBold] = useState(() => {
    return localStorage.getItem('net_calc_wm_is_bold') === 'true';
  });


  // Logo Config States
  const [logoUrl, setLogoUrl] = useState(() => {
    return localStorage.getItem('net_calc_wm_logo') || null;
  });
  const [logoWidth, setLogoWidth] = useState(() => {
    const saved = localStorage.getItem('net_calc_wm_logo_width');
    return saved ? parseInt(saved, 10) : 100;
  });
  const [logoOpacity, setLogoOpacity] = useState(() => {
    const saved = localStorage.getItem('net_calc_wm_logo_opacity');
    return saved ? parseFloat(saved) : 0.6;
  });

  // Drag Position States
  const [x, setX] = useState(() => {
    const saved = localStorage.getItem('net_calc_wm_x');
    return saved ? parseFloat(saved) : 50;
  });
  const [y, setY] = useState(() => {
    const saved = localStorage.getItem('net_calc_wm_y');
    return saved ? parseFloat(saved) : 50;
  });

  // Layout Pattern & Rotation States
  const [layoutMode, setLayoutMode] = useState(() => {
    return localStorage.getItem('net_calc_wm_layout_mode') || 'pattern';
  });
  const [patternRows, setPatternRows] = useState(() => {
    const saved = localStorage.getItem('net_calc_wm_rows');
    return saved ? parseInt(saved, 10) : 2;
  });
  const [patternCols, setPatternCols] = useState(() => {
    const saved = localStorage.getItem('net_calc_wm_cols');
    return saved ? parseInt(saved, 10) : 10;
  });
  // Gap is stored as % of image dimension (0–80). This scales correctly
  // regardless of whether the image is 500px or 5000px wide.
  const [patternGapX, setPatternGapX] = useState(() => {
    const saved = localStorage.getItem('net_calc_wm_gap_x_pct');
    return saved ? parseInt(saved, 10) : 5;
  });
  const [rotation, setRotation] = useState(() => {
    const saved = localStorage.getItem('net_calc_wm_rotation');
    return saved !== null ? parseInt(saved, 10) : 0;
  });
  const [patternStagger, setPatternStagger] = useState(() => {
    const saved = localStorage.getItem('net_calc_wm_stagger');
    return saved !== null ? saved === 'true' : true;
  });

  // Track the actual pixel size of the preview container so preview gaps
  // can be computed as the same % of preview width as the canvas uses
  const [previewPxW, setPreviewPxW] = useState(320);

  // Quick Style Presets — 4 ready-to-use professional configurations + Single
  const PRESET_STYLES = [
    {
      id: 'two_rows_0',
      label: 'Top & Bottom (0°)',
      active: layoutMode === 'pattern' && patternRows === 2 && patternCols === 10 && patternGapX === 5 && rotation === 0,
      apply: () => {
        setLayoutMode('pattern');
        setPatternRows(2);
        setPatternCols(10);
        setPatternGapX(5);
        setRotation(0);
        setX(50);
        setY(50);
        setPatternStagger(true);
      }
    },
    {
      id: 'two_rows_neg45',
      label: 'Top & Bottom (-45°)',
      active: layoutMode === 'pattern' && patternRows === 2 && patternCols === 10 && patternGapX === 5 && rotation === -45,
      apply: () => {
        setLayoutMode('pattern');
        setPatternRows(2);
        setPatternCols(10);
        setPatternGapX(5);
        setRotation(-45);
        setX(50);
        setY(50);
        setPatternStagger(true);
      }
    },
    {
      id: 'five_rows_0',
      label: '5-Row Grid (0°)',
      active: layoutMode === 'pattern' && patternRows === 5 && patternCols === 10 && patternGapX === 5 && rotation === 0,
      apply: () => {
        setLayoutMode('pattern');
        setPatternRows(5);
        setPatternCols(10);
        setPatternGapX(5);
        setRotation(0);
        setX(50);
        setY(50);
        setPatternStagger(true);
      }
    },
    {
      id: 'five_rows_neg45',
      label: '5-Row Cross (-45°)',
      active: layoutMode === 'pattern' && patternRows === 5 && patternCols === 10 && patternGapX === 5 && rotation === -45,
      apply: () => {
        setLayoutMode('pattern');
        setPatternRows(5);
        setPatternCols(10);
        setPatternGapX(5);
        setRotation(-45);
        setX(50);
        setY(50);
        setPatternStagger(true);
      }
    },
    {
      id: 'single_mark',
      label: 'Single Mark',
      active: layoutMode === 'single',
      apply: () => {
        setLayoutMode('single');
        setRotation(0);
        setX(50);
        setY(50);
      }
    }
  ];

  // Image Processing States
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [rawPreviewUrls, setRawPreviewUrls] = useState([]);
  const [watermarkedUrls, setWatermarkedUrls] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);
  const [isAdjusting, setIsAdjusting] = useState(false);

  const containerRef = useRef(null);
  const previewWrapperRef = useRef(null);
  const isDraggingRef = useRef(false);

  // Sync general configurations
  useEffect(() => {
    localStorage.setItem('net_calc_wm_type', wmType);
  }, [wmType]);

  useEffect(() => {
    localStorage.setItem('net_calc_wm_text', text);
  }, [text]);

  useEffect(() => {
    localStorage.setItem('net_calc_wm_font', fontFamily);
  }, [fontFamily]);

  useEffect(() => {
    localStorage.setItem('net_calc_wm_color', color);
  }, [color]);

  useEffect(() => {
    localStorage.setItem('net_calc_wm_size', size.toString());
  }, [size]);

  useEffect(() => {
    localStorage.setItem('net_calc_wm_opacity', opacity.toString());
  }, [opacity]);

  useEffect(() => {
    localStorage.setItem('net_calc_wm_is_bold', isBold.toString());
  }, [isBold]);

  useEffect(() => {
    localStorage.setItem('net_calc_wm_logo_width', logoWidth.toString());
  }, [logoWidth]);

  useEffect(() => {
    localStorage.setItem('net_calc_wm_logo_opacity', logoOpacity.toString());
  }, [logoOpacity]);

  useEffect(() => {
    localStorage.setItem('net_calc_wm_x', x.toString());
    localStorage.setItem('net_calc_wm_y', y.toString());
  }, [x, y]);

  useEffect(() => {
    localStorage.setItem('net_calc_wm_layout_mode', layoutMode);
  }, [layoutMode]);

  useEffect(() => {
    localStorage.setItem('net_calc_wm_rows', patternRows.toString());
  }, [patternRows]);

  useEffect(() => {
    localStorage.setItem('net_calc_wm_cols', patternCols.toString());
  }, [patternCols]);

  useEffect(() => {
    localStorage.setItem('net_calc_wm_gap_x_pct', patternGapX.toString());
  }, [patternGapX]);

  // Measure preview wrapper dimensions whenever isAdjusting opens
  useEffect(() => {
    if (!isAdjusting) return;
    const measure = () => {
      if (previewWrapperRef.current) {
        const rect = previewWrapperRef.current.getBoundingClientRect();
        setPreviewPxW(rect.width || 320);
      }
    };
    // Measure after layout
    const id = setTimeout(measure, 50);
    window.addEventListener('resize', measure);
    return () => {
      clearTimeout(id);
      window.removeEventListener('resize', measure);
    };
  }, [isAdjusting]);

  useEffect(() => {
    localStorage.setItem('net_calc_wm_rotation', rotation.toString());
  }, [rotation]);

  useEffect(() => {
    localStorage.setItem('net_calc_wm_stagger', patternStagger.toString());
  }, [patternStagger]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      rawPreviewUrls.forEach(url => {
        URL.revokeObjectURL(url);
      });
    };
  }, [rawPreviewUrls]);

  // Resizing and storing logo
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = (maxDim / width) * height;
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = (maxDim / height) * width;
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const resizedBase64 = canvas.toDataURL('image/png');
        setLogoUrl(resizedBase64);
        localStorage.setItem('net_calc_wm_logo', resizedBase64);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Drag and Drop implementation
  const updatePosition = useCallback((clientX, clientY) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const newX = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    setX(newX);
    if (layoutMode !== 'pattern') {
      const newY = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));
      setY(newY);
    }
  }, [layoutMode]);

  const handleMouseDown = (e) => {
    isDraggingRef.current = true;
    updatePosition(e.clientX, e.clientY);
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return;
    updatePosition(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Bind non-passive touch listeners to prevent mobile viewport scroll during drag
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onTouchStart = (e) => {
      isDraggingRef.current = true;
      if (e.touches[0]) {
        updatePosition(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const onTouchMove = (e) => {
      if (!isDraggingRef.current) return;
      if (e.cancelable) {
        e.preventDefault();
      }
      if (e.touches[0]) {
        updatePosition(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    container.addEventListener('touchstart', onTouchStart, { passive: false });
    container.addEventListener('touchmove', onTouchMove, { passive: false });

    return () => {
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
    };
  }, [isAdjusting, updatePosition]);

  // Setup document mouseup listener for smooth drag release
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      isDraggingRef.current = false;
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('touchend', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('touchend', handleGlobalMouseUp);
    };
  }, []);

  // Multi-image upload handler
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadedFiles(prev => [...prev, ...files]);
    setRawPreviewUrls(prev => [...prev, ...files.map(file => URL.createObjectURL(file))]);
    setWatermarkedUrls(prev => [...prev, ...files.map(() => null)]);
  };

  const clearAllFiles = () => {
    rawPreviewUrls.forEach(url => URL.revokeObjectURL(url));
    setUploadedFiles([]);
    setRawPreviewUrls([]);
    setWatermarkedUrls([]);
    setActivePreviewIndex(0);
  };

  const removeUploadedFile = (index) => {
    if (rawPreviewUrls[index]) {
      URL.revokeObjectURL(rawPreviewUrls[index]);
    }

    setUploadedFiles(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
    setRawPreviewUrls(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
    setWatermarkedUrls(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });

    if (activePreviewIndex >= uploadedFiles.length - 1) {
      setActivePreviewIndex(Math.max(0, uploadedFiles.length - 2));
    }
  };

  // Canvas processing engine
  const applyWatermark = async () => {
    if (uploadedFiles.length === 0) return;
    setIsProcessing(true);
    const results = [];

    const loadImage = (src, useCrossOrigin = false) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        if (useCrossOrigin) img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });
    };

    try {
      let logoImgElement = null;
      if (wmType === 'logo' && logoUrl) {
        logoImgElement = await loadImage(logoUrl);
      }

      for (let idx = 0; idx < uploadedFiles.length; idx++) {
        const file = uploadedFiles[idx];
        const previewUrl = rawPreviewUrls[idx];
        const img = await loadImage(previewUrl);

        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');

        // Draw original
        ctx.drawImage(img, 0, 0);

        const imgWidth = img.naturalWidth;
        const imgHeight = img.naturalHeight;

        // Position coordinates
        const px = (x / 100) * imgWidth;
        const py = layoutMode === 'pattern' ? 0.50 * imgHeight : (y / 100) * imgHeight;

        const rows = layoutMode === 'pattern' ? patternRows : 1;
        const cols = layoutMode === 'pattern' ? patternCols : 1;
        // Gap is stored as % of image dimension so it always scales
        const canvasGapX = (patternGapX / 100) * imgWidth;

        ctx.save();
        ctx.translate(px, py);
        if (rotation !== 0) {
          ctx.rotate((rotation * Math.PI) / 180);
        }

        if (wmType === 'text') {
          const scaledFontSize = (size / 500) * imgWidth;
          ctx.globalAlpha = opacity;
          ctx.font = `${isBold ? 'bold ' : ''}${scaledFontSize}px "${fontFamily}", sans-serif`;
          ctx.fillStyle = color;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          const metrics = ctx.measureText(text || ' ');
          const itemW = metrics.width;
          const itemH = scaledFontSize;
          // Standard proportional margin (4% of height, min 8px)
          const padY = Math.max(8, imgHeight * 0.04);
          const topY = itemH / 2 + padY;
          const bottomY = imgHeight - itemH / 2 - padY;
          const totalSpan = Math.max(0, bottomY - topY);
          const rowSpacing = rows > 1 ? totalSpan / (rows - 1) : 0;

          for (let r = 0; r < rows; r++) {
            let rCenterY;
            if (layoutMode === 'pattern') {
              if (rows === 1) {
                rCenterY = bottomY - (imgHeight / 2);
              } else {
                rCenterY = (topY + r * rowSpacing) - (imgHeight / 2);
              }
            } else {
              rCenterY = 0;
            }

            for (let c = 0; c < cols; c++) {
              let cCenterX = (c - (cols - 1) / 2) * (itemW + canvasGapX);
              if (layoutMode === 'pattern' && patternStagger && r % 2 === 1) {
                cCenterX += (itemW + canvasGapX) / 2;
              }
              ctx.fillText(text || '', cCenterX, rCenterY);
            }
          }
        } else if (wmType === 'logo' && logoImgElement) {
          const scaledLogoWidth = (logoWidth / 500) * imgWidth;
          const aspect = logoImgElement.naturalHeight / logoImgElement.naturalWidth;
          const scaledLogoHeight = scaledLogoWidth * aspect;

          ctx.globalAlpha = logoOpacity;
          const itemW = scaledLogoWidth;
          const itemH = scaledLogoHeight;
          // Standard proportional margin (4% of height, min 8px)
          const padY = Math.max(8, imgHeight * 0.04);
          const topY = itemH / 2 + padY;
          const bottomY = imgHeight - itemH / 2 - padY;
          const totalSpan = Math.max(0, bottomY - topY);
          const rowSpacing = rows > 1 ? totalSpan / (rows - 1) : 0;

          for (let r = 0; r < rows; r++) {
            let rCenterY;
            if (layoutMode === 'pattern') {
              if (rows === 1) {
                rCenterY = bottomY - (imgHeight / 2);
              } else {
                rCenterY = (topY + r * rowSpacing) - (imgHeight / 2);
              }
            } else {
              rCenterY = 0;
            }

            for (let c = 0; c < cols; c++) {
              let cCenterX = (c - (cols - 1) / 2) * (itemW + canvasGapX);
              if (layoutMode === 'pattern' && patternStagger && r % 2 === 1) {
                cCenterX += (itemW + canvasGapX) / 2;
              }
              ctx.drawImage(
                logoImgElement,
                cCenterX - itemW / 2,
                rCenterY - itemH / 2,
                itemW,
                itemH
              );
            }
          }
        }
        ctx.restore();

        const watermarkedUrl = canvas.toDataURL(file.type || 'image/png');
        results.push(watermarkedUrl);
      }

      setWatermarkedUrls(results);
    } catch (err) {
      console.error('Error applying watermark:', err);
      alert('Error processing images. Please check the formats and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Detect iOS (iPhone / iPad)
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  // Check if Web Share API with file sharing is supported
  const canShareFiles = () => {
    try {
      return !!navigator.share && !!navigator.canShare;
    } catch {
      return false;
    }
  };

  // Convert data URL to a File object for sharing
  const dataUrlToFile = async (url, fileName) => {
    const blob = await fetch(url).then(r => r.blob());
    const dotIdx = fileName.lastIndexOf('.');
    const name = dotIdx !== -1 ? fileName.substring(0, dotIdx) : fileName;
    const ext = dotIdx !== -1 ? fileName.substring(dotIdx) : '.png';
    return new File([blob], `${name}-watermarked${ext}`, { type: blob.type });
  };

  // Download / Save logic
  const downloadSingleImage = async (url, fileName) => {
    // On iOS with Web Share API: trigger native share sheet directly on this page
    if (isIOS && canShareFiles()) {
      try {
        const file = await dataUrlToFile(url, fileName);
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'Watermarked Image',
          });
          return;
        }
      } catch (err) {
        // User cancelled or share failed — fall through to normal download
        if (err.name === 'AbortError') return;
      }
    }

    // Non-iOS or fallback: standard anchor download
    const dotIdx = fileName.lastIndexOf('.');
    const name = dotIdx !== -1 ? fileName.substring(0, dotIdx) : fileName;
    const ext = dotIdx !== -1 ? fileName.substring(dotIdx) : '.png';
    const downloadName = `${name}-watermarked${ext}`;

    fetch(url)
      .then(r => r.blob())
      .then(blob => {
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = downloadName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 500);
      })
      .catch(() => {
        const link = document.createElement('a');
        link.href = url;
        link.download = downloadName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
  };

  const downloadAll = async () => {
    const readyPairs = uploadedFiles
      .map((file, idx) => ({ url: watermarkedUrls[idx], name: file.name }))
      .filter(p => p.url);

    // On iOS with Web Share API: share ALL files at once in one native sheet
    if (isIOS && canShareFiles() && readyPairs.length > 0) {
      try {
        const files = await Promise.all(
          readyPairs.map(p => dataUrlToFile(p.url, p.name))
        );
        if (navigator.canShare({ files })) {
          await navigator.share({
            files,
            title: 'Watermarked Images',
          });
          return;
        }
      } catch (err) {
        if (err.name === 'AbortError') return;
        // Fall through to staggered single downloads
      }
    }

    // Non-iOS or fallback: staggered single downloads
    readyPairs.forEach((p, i) => {
      setTimeout(() => downloadSingleImage(p.url, p.name), i * 600);
    });
  };


  if (isAdjusting) {
    return (
      <div className="watermark-studio-page animate-fade-in">
        {/* Adjustment Sub-page */}
        <div className="watermark-studio-header">
          <button className="btn btn-glass btn-icon-only" onClick={() => setIsAdjusting(false)} title="Back to Watermark Studio">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 className="watermark-studio-title">Set Watermark & Placement</h2>
          </div>
        </div>

        <div className="watermark-studio-body" style={{ marginTop: '0.5rem' }}>
          {/* Workspace preview box */}
          <div className="wm-workspace-panel">
            <div className="wm-preview-wrapper" style={{ position: 'relative', overflow: 'hidden' }} ref={previewWrapperRef}>
              {/* If an image is uploaded, display it as background */}
              {rawPreviewUrls.length > 0 && rawPreviewUrls[activePreviewIndex] && (
                <img
                  src={rawPreviewUrls[activePreviewIndex]}
                  alt="Preview Background"
                  className="wm-preview-image"
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    pointerEvents: 'none',
                    opacity: 0.85
                  }}
                />
              )}

              <div
                className="wm-draggable-container"
                ref={containerRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
              >
                {/* Draggable Watermark Node / Pattern Group */}
                {(() => {
                  const isPattern = layoutMode === 'pattern';
                  // Compute preview column gaps as % of preview width
                  const pgxPx = isPattern ? (patternGapX / 100) * previewPxW : 0;
                  const estItemWidth = wmType === 'text'
                    ? Math.max(24, (text || 'Net Calculate').length * size * 0.52)
                    : logoWidth;

                  return (
                    <div
                      className={`wm-draggable-element ${isDraggingRef.current ? 'is-dragging' : ''}`}
                      style={{
                        left: `${x}%`,
                        top: isPattern ? '50%' : `${y}%`,
                        height: isPattern ? 'calc(100% - 16px)' : 'auto',
                        boxSizing: 'border-box',
                        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: isPattern
                          ? (patternRows === 1 ? 'flex-end' : 'space-between')
                          : 'center',
                        alignItems: 'center',
                        border: '1px dashed rgba(99, 179, 237, 0.65)',
                        background: isDraggingRef.current ? 'rgba(99, 179, 237, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                        backdropFilter: 'blur(2px)',
                        padding: isPattern ? '6px 10px' : '8px 12px',
                        borderRadius: '6px',
                        cursor: 'move',
                        userSelect: 'none',
                        transition: isDraggingRef.current ? 'none' : 'box-shadow 0.2s ease, transform 0.1s ease',
                        boxShadow: isDraggingRef.current ? '0 0 18px rgba(99, 179, 237, 0.45)' : 'none'
                      }}
                    >
                      {Array.from({ length: layoutMode === 'pattern' ? patternRows : 1 }).map((_, rIdx) => {
                        const staggerShift = (pgxPx + estItemWidth) / 2;
                        return (
                          <div
                            key={rIdx}
                            style={{
                              display: 'flex',
                              gap: `${pgxPx}px`,
                              alignItems: 'center',
                              justifyContent: 'center',
                              transform: (layoutMode === 'pattern' && patternStagger && rIdx % 2 === 1)
                                ? `translateX(${staggerShift}px)`
                                : 'none'
                            }}
                          >
                            {Array.from({ length: layoutMode === 'pattern' ? patternCols : 1 }).map((_, cIdx) => (
                              <div
                                key={cIdx}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  pointerEvents: 'none',
                                  lineHeight: 1
                                }}
                              >
                                {wmType === 'text' ? (
                                  <span
                                    style={{
                                      fontFamily: `"${fontFamily}", sans-serif`,
                                      fontSize: `${size}px`,
                                      fontWeight: isBold ? 'bold' : 'normal',
                                      color: color,
                                      opacity: opacity,
                                      whiteSpace: 'nowrap',
                                      textShadow: '0 1px 3px rgba(0,0,0,0.85)'
                                    }}
                                  >
                                    {text || 'Net Calculate'}
                                  </span>
                                ) : (
                                  logoUrl ? (
                                    <img
                                      src={logoUrl}
                                      alt="Watermark Logo"
                                      className="wm-draggable-logo"
                                      style={{
                                        width: `${logoWidth}px`,
                                        height: 'auto',
                                        opacity: logoOpacity,
                                        filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.7))'
                                      }}
                                    />
                                  ) : (
                                    <span style={{ fontSize: '12px', color: '#ccc' }}>Upload Logo</span>
                                  )
                                )}
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>

            <p className="wm-workspace-instruction">
              <Move size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Hold and drag watermark anywhere in the box to adjust placement
            </p>
          </div>

          {/* Configuration Card */}
          <div className="wm-controls-panel">
            {/* Watermark Design & Layout Card — simplified for mobile */}
            <div className="wm-section-card">
              <div className="wm-section-title">Watermark Layout & Pattern</div>

              {/* Layout Mode Selector */}
              <div className="wm-layout-selector">
                <button
                  type="button"
                  className={`wm-layout-btn ${layoutMode === 'single' ? 'active' : ''}`}
                  onClick={() => setLayoutMode('single')}
                >
                  <Move size={14} />
                  Single
                </button>
                <button
                  type="button"
                  className={`wm-layout-btn ${layoutMode === 'pattern' ? 'active' : ''}`}
                  onClick={() => setLayoutMode('pattern')}
                >
                  <Grid size={14} />
                  Grid / Cross
                </button>
              </div>

              {/* Quick Style Presets */}
              <div className="wm-presets-wrapper">
                {PRESET_STYLES.map(preset => (
                  <button
                    key={preset.id}
                    type="button"
                    className={`wm-preset-chip ${preset.active ? 'active' : ''}`}
                    onClick={() => preset.apply()}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Pattern Controls — only in pattern mode */}
              {layoutMode === 'pattern' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Rows & Cols as simple big steppers side by side */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    {/* Rows stepper */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Rows</span>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-color)' }}>
                          {patternRows === 1 ? 'Bottom' : patternRows === 2 ? 'Top & Bottom' : patternRows === 3 ? 'Top, Mid, Bottom' : `${patternRows} Auto Spaced`}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--input-bg)', border: '1px solid var(--card-border)', borderRadius: '10px', padding: '0.35rem' }}>
                        <button
                          type="button"
                          className="wm-stepper-btn"
                          style={{ width: '36px', height: '36px', borderRadius: '7px', fontSize: '1.2rem' }}
                          onClick={() => setPatternRows(r => Math.max(1, r - 1))}
                          disabled={patternRows <= 1}
                        >−</button>
                        <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)', minWidth: '24px', textAlign: 'center' }}>{patternRows}</span>
                        <button
                          type="button"
                          className="wm-stepper-btn"
                          style={{ width: '36px', height: '36px', borderRadius: '7px', fontSize: '1.2rem' }}
                          onClick={() => setPatternRows(r => Math.min(10, r + 1))}
                          disabled={patternRows >= 10}
                        >+</button>
                      </div>
                    </div>

                    {/* Cols stepper */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Columns</span>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--input-bg)', border: '1px solid var(--card-border)', borderRadius: '10px', padding: '0.35rem' }}>
                        <button
                          type="button"
                          className="wm-stepper-btn"
                          style={{ width: '36px', height: '36px', borderRadius: '7px', fontSize: '1.2rem' }}
                          onClick={() => setPatternCols(c => Math.max(1, c - 1))}
                          disabled={patternCols <= 1}
                        >−</button>
                        <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)', minWidth: '24px', textAlign: 'center' }}>{patternCols}</span>
                        <button
                          type="button"
                          className="wm-stepper-btn"
                          style={{ width: '36px', height: '36px', borderRadius: '7px', fontSize: '1.2rem' }}
                          onClick={() => setPatternCols(c => Math.min(10, c + 1))}
                          disabled={patternCols >= 10}
                        >+</button>
                      </div>
                    </div>
                  </div>

                  {/* Column Gap */}
                  <div className="wm-control-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label>Column Gap</label>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-color)' }}>{patternGapX}%</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="200"
                      className="wm-slider"
                      style={{ width: '100%' }}
                      value={patternGapX}
                      onChange={e => setPatternGapX(parseInt(e.target.value, 10))}
                    />
                  </div>

                  {/* Stagger toggle */}
                  <label className="wm-checkbox-row">
                    <input
                      type="checkbox"
                      checked={patternStagger}
                      onChange={e => setPatternStagger(e.target.checked)}
                    />
                    <span>Shift alternate rows (diagonal cross effect)</span>
                  </label>
                </div>
              )}

              {/* Divider */}
              <div style={{ borderTop: '1px solid var(--card-border)', marginTop: '0.25rem', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                {/* Rotation */}
                <div className="wm-control-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <RotateCw size={13} /> Rotation
                    </label>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-color)' }}>{rotation}°</span>
                  </div>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    step="5"
                    className="wm-slider"
                    style={{ width: '100%' }}
                    value={rotation}
                    onChange={e => setRotation(parseInt(e.target.value, 10))}
                  />
                  {/* Angle quick chips */}
                  <div className="wm-chips-row">
                    {[
                      { label: '0°', val: 0 },
                      { label: '45°', val: 45 },
                      { label: '-45°', val: -45 },
                      { label: '30°', val: 30 },
                      { label: '90°', val: 90 }
                    ].map(item => (
                      <button
                        key={item.val}
                        type="button"
                        className={`wm-chip-btn ${rotation === item.val ? 'active' : ''}`}
                        onClick={() => setRotation(item.val)}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Visual position picker */}
                <div className="wm-control-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label>Position</label>
                    {layoutMode === 'pattern' && (
                      <span style={{ fontSize: '0.72rem', color: 'var(--accent-color)', fontWeight: 600 }}>
                        Rows auto-spaced vertically
                      </span>
                    )}
                  </div>
                  {layoutMode === 'pattern' ? (
                    <div style={{ display: 'flex', gap: '0.5rem', maxWidth: '280px' }}>
                      {[
                        { label: 'Left', posX: 15 },
                        { label: 'Center', posX: 50 },
                        { label: 'Right', posX: 85 }
                      ].map(p => {
                        const isActive = Math.abs(Math.round(x) - p.posX) <= 10;
                        return (
                          <button
                            key={p.label}
                            type="button"
                            className={`wm-chip-btn ${isActive ? 'active' : ''}`}
                            style={{ flex: 1, padding: '0.55rem 0.5rem', fontWeight: 600, fontSize: '0.85rem' }}
                            onClick={() => setX(p.posX)}
                          >
                            {p.label}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem', maxWidth: '180px' }}>
                      {[
                        { label: '↖', posX: 15, posY: 15 },
                        { label: '↑', posX: 50, posY: 15 },
                        { label: '↗', posX: 85, posY: 15 },
                        { label: '←', posX: 15, posY: 50 },
                        { label: '⊕', posX: 50, posY: 50 },
                        { label: '→', posX: 85, posY: 50 },
                        { label: '↙', posX: 15, posY: 85 },
                        { label: '↓', posX: 50, posY: 85 },
                        { label: '↘', posX: 85, posY: 85 }
                      ].map(p => {
                        const isActive = Math.abs(Math.round(x) - p.posX) <= 5 && Math.abs(Math.round(y) - p.posY) <= 5;
                        return (
                          <button
                            key={p.label}
                            type="button"
                            className={`wm-position-btn ${isActive ? 'active' : ''}`}
                            style={{ height: '36px', fontSize: '1rem' }}
                            onClick={() => { setX(p.posX); setY(p.posY); }}
                            title={`Place at (${p.posX}%, ${p.posY}%)`}
                          >
                            {p.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  <span style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'block' }}>
                    {layoutMode === 'pattern' ? 'Slide watermark horizontally or tap Left / Center / Right' : 'Or drag the watermark in the preview box above'}
                  </span>
                </div>
              </div>
            </div>

            {/* Existing Style Configuration Card */}
            <div className="wm-section-card">
              <div className="wm-section-title">Customize Watermark Type & Styles</div>

              {/* Tab Selector */}
              <div className="input-toggle-group" style={{ marginBottom: '0.25rem', width: 'fit-content' }}>
                <button
                  className={`toggle-btn ${wmType === 'text' ? 'active' : ''}`}
                  onClick={() => setWmType('text')}
                  style={{ padding: '0.5rem 0.75rem' }}
                  title="Text Watermark"
                >
                  <Type size={15} />
                </button>
                <button
                  className={`toggle-btn ${wmType === 'logo' ? 'active' : ''}`}
                  onClick={() => setWmType('logo')}
                  style={{ padding: '0.5rem 0.75rem' }}
                  title="Logo / Image Watermark"
                >
                  <ImageIcon size={15} />
                </button>
              </div>

              {wmType === 'text' ? (
                // Text Controls
                <>
                  <div className="wm-control-group">
                    <label>Watermark Text</label>
                    <input
                      type="text"
                      className="wm-text-input"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Type text watermark"
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', width: '100%', marginBottom: '1rem' }}>
                    <div className="wm-control-group" style={{ flex: 1, marginBottom: 0 }}>
                      <label>Font Family</label>
                      <Select
                        value={FONTS.find((font) => font.value === fontFamily) || FONTS[FONTS.length - 1]}
                        onChange={(selectedOption) => setFontFamily(selectedOption ? selectedOption.value : 'sans-serif')}
                        options={FONTS}
                        styles={selectStyles}
                        isSearchable={false}
                      />
                    </div>
                    <div className="wm-control-group" style={{ flexShrink: 0, marginBottom: 0 }}>
                      <button
                        type="button"
                        className={`btn-wm-bold-toggle ${isBold ? 'active' : ''}`}
                        onClick={() => setIsBold(!isBold)}
                        title="Toggle Bold Style"
                      >
                        B
                      </button>
                    </div>
                  </div>

                  <div className="wm-control-group">
                    <label>Text Color</label>
                    <div className="wm-color-picker-row">
                      {PRESET_COLORS.map((c) => (
                        <button
                          key={c}
                          className={`wm-color-circle-btn ${color === c ? 'active' : ''}`}
                          style={{ backgroundColor: c }}
                          onClick={() => setColor(c)}
                        />
                      ))}
                      <input
                        type="color"
                        className="wm-custom-color-input"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        title="Custom Color"
                      />
                    </div>
                  </div>

                  <div className="wm-row-group">
                    <div className="wm-control-group">
                      <label>Font Size</label>
                      <div className="wm-slider-container">
                        <input
                          type="range"
                          min="10"
                          max="80"
                          className="wm-slider"
                          value={size}
                          onChange={(e) => setSize(parseInt(e.target.value, 10))}
                        />
                        <span>{size}px</span>
                      </div>
                    </div>

                    <div className="wm-control-group">
                      <label>Opacity</label>
                      <div className="wm-slider-container">
                        <input
                          type="range"
                          min="0.1"
                          max="1.0"
                          step="0.05"
                          className="wm-slider"
                          value={opacity}
                          onChange={(e) => setOpacity(parseFloat(e.target.value))}
                        />
                        <span>{Math.round(opacity * 100)}%</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                // Logo Controls
                <>
                  <div className="wm-control-group">
                    <label>Upload Logo</label>
                    {logoUrl ? (
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <img
                          src={logoUrl}
                          alt="Logo Preview"
                          style={{
                            maxWidth: '60px',
                            maxHeight: '60px',
                            objectFit: 'contain',
                            borderRadius: '6px',
                            border: '1px solid var(--card-border)',
                            background: '#111'
                          }}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Logo Active</span>
                          <label className="btn-wm-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', cursor: 'pointer', textAlign: 'center' }}>
                            Replace Logo
                            <input
                              type="file"
                              accept="image/*"
                              style={{ display: 'none' }}
                              onChange={handleLogoUpload}
                            />
                          </label>
                        </div>
                      </div>
                    ) : (
                      <div className="wm-upload-zone" style={{ padding: '1rem' }}>
                        <ImageIcon size={20} className="wm-upload-icon" />
                        <p className="wm-upload-text" style={{ fontSize: '0.8rem' }}>Upload Logo PNG/JPG</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                        />
                      </div>
                    )}
                  </div>

                  <div className="wm-row-group" style={{ marginTop: '0.5rem' }}>
                    <div className="wm-control-group">
                      <label>Logo Width</label>
                      <div className="wm-slider-container">
                        <input
                          type="range"
                          min="40"
                          max="250"
                          className="wm-slider"
                          disabled={!logoUrl}
                          value={logoWidth}
                          onChange={(e) => setLogoWidth(parseInt(e.target.value, 10))}
                        />
                        <span>{logoWidth}px</span>
                      </div>
                    </div>

                    <div className="wm-control-group">
                      <label>Opacity</label>
                      <div className="wm-slider-container">
                        <input
                          type="range"
                          min="0.1"
                          max="1.0"
                          step="0.05"
                          className="wm-slider"
                          disabled={!logoUrl}
                          value={logoOpacity}
                          onChange={(e) => setLogoOpacity(parseFloat(e.target.value))}
                        />
                        <span>{Math.round(logoOpacity * 100)}%</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <button
              className="btn-wm-primary"
              onClick={() => setIsAdjusting(false)}
              style={{ width: '100%', height: '44px', marginTop: '1rem' }}
            >
              Done & Save Settings
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main Watermark Studio Page
  return (
    <div className="watermark-studio-page animate-fade-in">
      {/* Page Header */}
      <div className="watermark-studio-header">
        <button className="btn btn-glass btn-icon-only" onClick={onBack} title="Back to Calculator">
          <ArrowLeft size={16} />
        </button>
        <div>
          <h2 className="watermark-studio-title">Watermark Studio</h2>
        </div>
      </div>

      {/* Page Body */}
      <div className="watermark-studio-body">
        {/* Large Scrollable Previews (above and outside the card container) */}
        {uploadedFiles.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
            <button
              onClick={clearAllFiles}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.4rem 0.85rem',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                borderRadius: '8px',
                color: '#f87171',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.6)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.35)';
              }}
              title="Clear all uploaded photos"
            >
              <Trash2 size={13} />
              Clear All Photos
            </button>
          </div>
        )}
        {uploadedFiles.length > 0 && (
          <div className="wm-large-previews-container">
            {uploadedFiles.map((file, idx) => (
              <div
                key={idx}
                className={`wm-large-preview-card ${activePreviewIndex === idx ? 'active' : ''} ${watermarkedUrls[idx] ? 'ready' : ''}`}
                onClick={() => {
                  setActivePreviewIndex(idx);
                  setLightboxIndex(idx);
                }}
              >
                <img
                  src={watermarkedUrls[idx] || rawPreviewUrls[idx]}
                  alt={`Preview ${idx}`}
                  className="wm-large-preview-img"
                />
                
                {/* Individual Download Button (only if watermarked/ready) */}
                {watermarkedUrls[idx] && (
                  <button
                    className="wm-large-preview-download"
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadSingleImage(watermarkedUrls[idx], file.name);
                    }}
                    title="Download Watermarked Image"
                  >
                    <Download size={15} />
                  </button>
                )}

                {/* Remove Button */}
                <button
                  className="wm-large-preview-remove"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeUploadedFile(idx);
                  }}
                  title="Remove Image"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Action Controls Bar (Above Settings Cards) */}
        {uploadedFiles.length > 0 && (
          <div style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '1.25rem',
            width: '100%',
            justifyContent: 'stretch',
            flexWrap: 'wrap'
          }}>
            <button
              className="btn-wm-primary"
              onClick={applyWatermark}
              disabled={isProcessing || (wmType === 'logo' && !logoUrl)}
              style={{
                flex: 1,
                minWidth: '150px',
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {isProcessing ? (
                <>Processing...</>
              ) : (
                <>
                  <Sparkles size={16} />
                  Apply Watermark
                </>
              )}
            </button>
            
            <button
              className={`btn-wm-secondary${uploadedFiles.length > 0 && watermarkedUrls.length === uploadedFiles.length && watermarkedUrls.every(u => u !== null) ? ' btn-wm-success' : ''}`}
              onClick={downloadAll}
              disabled={isProcessing || uploadedFiles.length === 0 || !watermarkedUrls.every(u => u !== null)}
              style={{
                flex: 1,
                minWidth: '150px',
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Download size={16} />
              {isIOS ? 'Save to Photos' : 'Download All'}
            </button>
          </div>
        )}

        {/* iOS Save-to-Photos instruction banner */}
        {isIOS && watermarkedUrls.some(u => u !== null) && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            borderRadius: '10px',
            padding: '10px 14px',
            marginBottom: '1rem',
            fontSize: '0.8rem',
            color: 'var(--text-primary)',
            lineHeight: 1.5,
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px'
          }}>
            <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>📸</span>
            <span>
              <strong>Save to Photos on iPhone:</strong> Tap <em>"Save to Photos"</em> above — iOS share sheet will open. Tap <strong>"Save Image"</strong> to save directly to your Photos library.
            </span>
          </div>
        )}

        {/* Upload Images Box */}
        <div className="wm-section-card">
          <div className="wm-section-title">Upload Images to Watermark</div>
          
          <div className="wm-upload-zone">
            <Upload size={24} className="wm-upload-icon" />
            <p className="wm-upload-text">Drag files here or click to select</p>
            <p className="wm-upload-subtext">Supports PNG, JPG, JPEG (Multiple files ok)</p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
            />
          </div>
        </div>

        {/* Template Style Config Summary */}
        <div className="wm-section-card">
          <div className="wm-section-title">Watermark Template Style</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                background: 'var(--wm-preview-bg)',
                border: '1px dashed var(--card-border)',
                borderRadius: '8px',
                padding: '10px 14px',
                minHeight: '64px',
                minWidth: '110px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <div style={{
                  transform: `rotate(${rotation}deg) scale(0.85)`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: layoutMode === 'pattern' ? '4px' : '0',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {Array.from({ length: layoutMode === 'pattern' ? Math.min(patternRows, 3) : 1 }).map((_, r) => (
                    <div
                      key={r}
                      style={{
                        display: 'flex',
                        gap: layoutMode === 'pattern' ? '6px' : '0',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transform: (layoutMode === 'pattern' && patternStagger && r % 2 === 1) ? 'translateX(6px)' : 'none'
                      }}
                    >
                      {Array.from({ length: layoutMode === 'pattern' ? Math.min(patternCols, 3) : 1 }).map((_, c) => (
                        <div key={c} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {wmType === 'text' ? (
                            <span style={{
                              fontSize: `${Math.min(size, 12)}px`,
                              fontFamily: `"${fontFamily}", sans-serif`,
                              fontWeight: isBold ? 'bold' : 'normal',
                              color: color,
                              opacity: opacity,
                              whiteSpace: 'nowrap'
                            }}>
                              {text || 'Net Calculate'}
                            </span>
                          ) : (
                            logoUrl ? (
                              <img
                                src={logoUrl}
                                alt="Logo"
                                style={{
                                  maxHeight: '18px',
                                  width: 'auto',
                                  opacity: logoOpacity
                                }}
                              />
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No Logo</span>
                            )
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {wmType === 'text' ? 'Text Watermark' : 'Logo Watermark'} — {layoutMode === 'pattern' ? `Cross Grid (${patternRows} rows × ${patternCols} cols, ${rotation}°)` : `Single (${rotation}°)`}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {layoutMode === 'pattern' ? `Auto Rows (${patternRows}r) • Col Gap: ${patternGapX}%${patternStagger ? ' • Staggered' : ''}` : `Position: (${Math.round(x)}%, ${Math.round(y)}%)`}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {wmType === 'text' ? `Font: ${fontFamily} • Size: ${size}px${isBold ? ' (Bold)' : ''}` : `Width: ${logoWidth}px`}
                </span>
              </div>
            </div>

            <button
              className="btn-wm-secondary"
              onClick={() => setIsAdjusting(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.55rem 1rem',
                fontSize: '0.85rem'
              }}
            >
              <Move size={14} /> Adjust Position & Customize
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox Preview Modal */}
      {lightboxIndex !== null && createPortal(
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.92)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            animation: 'fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          onClick={() => setLightboxIndex(null)}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setLightboxIndex(null); }}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: '#fff',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              transition: 'background 0.2s',
              zIndex: 100000
            }}
          >
            ✕
          </button>
          <img
            src={watermarkedUrls[lightboxIndex] || rawPreviewUrls[lightboxIndex]}
            alt="Fullscreen Lightbox Preview"
            style={{
              maxWidth: '95vw',
              maxHeight: '92vh',
              objectFit: 'contain',
              borderRadius: '8px',
              boxShadow: '0 12px 48px rgba(0,0,0,0.8)',
              border: watermarkedUrls[lightboxIndex] ? '2px solid #10b981' : '1px solid var(--card-border)'
            }}
            onClick={(e) => e.stopPropagation()}
          />
          {/* iOS hint inside lightbox */}
          {isIOS && watermarkedUrls[lightboxIndex] && (
            <p style={{
              position: 'absolute',
              bottom: '16px',
              left: 0,
              right: 0,
              textAlign: 'center',
              color: 'rgba(255,255,255,0.75)',
              fontSize: '0.78rem',
              pointerEvents: 'none',
              padding: '0 1rem'
            }}>
              📸 Long-press image → <strong style={{color:'#fff'}}>"Save to Photos"</strong>
            </p>
          )}
        </div>,
        document.body
      )}
    </div>
  );
};

export default WatermarkStudio;
