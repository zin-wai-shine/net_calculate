import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Select from 'react-select';
import { ArrowLeft, Upload, Download, Type, Image as ImageIcon, Move, Sparkles, Trash2 } from 'lucide-react';

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

  // Image Processing States
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [rawPreviewUrls, setRawPreviewUrls] = useState([]);
  const [watermarkedUrls, setWatermarkedUrls] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);
  const [isAdjusting, setIsAdjusting] = useState(false);

  const containerRef = useRef(null);
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
  const updatePosition = (clientX, clientY) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const newX = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const newY = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));
    setX(newX);
    setY(newY);
  };

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
  }, [isAdjusting]);

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
        const py = (y / 100) * imgHeight;

        if (wmType === 'text') {
          const scaledFontSize = (size / 500) * imgWidth;
          ctx.save();
          ctx.globalAlpha = opacity;
          ctx.font = `${isBold ? 'bold ' : ''}${scaledFontSize}px "${fontFamily}", sans-serif`;
          ctx.fillStyle = color;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(text, px, py);
          ctx.restore();
        } else if (wmType === 'logo' && logoImgElement) {
          const scaledLogoWidth = (logoWidth / 500) * imgWidth;
          const aspect = logoImgElement.naturalHeight / logoImgElement.naturalWidth;
          const scaledLogoHeight = scaledLogoWidth * aspect;

          ctx.save();
          ctx.globalAlpha = logoOpacity;
          ctx.drawImage(
            logoImgElement,
            px - scaledLogoWidth / 2,
            py - scaledLogoHeight / 2,
            scaledLogoWidth,
            scaledLogoHeight
          );
          ctx.restore();
        }

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
            <div className="wm-preview-wrapper">
              <div
                className="wm-draggable-container"
                ref={containerRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
              >
                {/* Draggable Watermark Node */}
                {wmType === 'text' ? (
                  <div
                    className={`wm-draggable-element ${isDraggingRef.current ? 'is-dragging' : ''}`}
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      fontFamily: `"${fontFamily}", sans-serif`,
                      fontSize: `${size}px`,
                      fontWeight: isBold ? 'bold' : 'normal',
                      color: color,
                      opacity: opacity
                    }}
                  >
                    {text}
                  </div>
                ) : (
                  logoUrl && (
                    <div
                      className={`wm-draggable-element ${isDraggingRef.current ? 'is-dragging' : ''}`}
                      style={{
                        left: `${x}%`,
                        top: `${y}%`,
                        opacity: logoOpacity
                      }}
                    >
                      <img
                        src={logoUrl}
                        alt="Watermark Logo"
                        className="wm-draggable-logo"
                        style={{
                          width: `${logoWidth}px`,
                          height: 'auto'
                        }}
                      />
                    </div>
                  )
                )}
              </div>
            </div>

            <p className="wm-workspace-instruction">
              <Move size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Hold and drag watermark inside the box to adjust placement
            </p>
          </div>

          {/* Configuration Card */}
          <div className="wm-controls-panel">
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
                padding: '10px 16px',
                minHeight: '56px',
                minWidth: '100px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: wmType === 'text' ? `${Math.min(size, 20)}px` : 'inherit',
                fontFamily: wmType === 'text' ? `"${fontFamily}", sans-serif` : 'inherit',
                fontWeight: (wmType === 'text' && isBold) ? 'bold' : 'normal',
                color: wmType === 'text' ? color : 'inherit',
                opacity: wmType === 'text' ? opacity : logoOpacity
              }}>
                {wmType === 'text' ? (
                  text || "Hello World"
                ) : (
                  logoUrl ? (
                    <img src={logoUrl} alt="Logo Preview" style={{ maxHeight: '36px', width: 'auto' }} />
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No Logo</span>
                  )
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Type: {wmType === 'text' ? 'Text Watermark' : 'Logo Watermark'}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {wmType === 'text' ? `Font: ${fontFamily} | Size: ${size}px${isBold ? ' (Bold)' : ''}` : `Width: ${logoWidth}px`}
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
