import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { drawCardsOnCanvas, parseCardPrice, formatNumberWithCommas, hexToRgba, isColorDark } from '../utils/cardRenderer';
import {
  ArrowLeft,
  Sparkles,
  RotateCcw,
  Palette,
  Edit3,
  Sun,
  Moon,
  Target,
  Bookmark,
  Plus,
  Trash2,
  Check,
  SquarePlus,
  Eye,
  Download,
  X,
  Droplets,
  Layers,
  Aperture,
  Pipette
} from 'lucide-react';

const GLASS_STYLES = [
  { id: 'frosted', name: 'Frosted Glass', icon: Layers, defaultOpacity: 25, defaultBlur: 10, defaultTint: '#ffffff' },
  { id: 'liquid', name: 'Liquid Glass', icon: Droplets, defaultOpacity: 35, defaultBlur: 14, defaultTint: '#ffffff' },
  { id: 'translucent', name: 'Translucent', icon: Sparkles, defaultOpacity: 15, defaultBlur: 8, defaultTint: '#ffffff' },
  { id: 'blur', name: 'Blur Card', icon: Aperture, defaultOpacity: 68, defaultBlur: 16, defaultTint: '#1e2430' }
];

const GLASS_TINT_PRESETS = [
  { id: 'white', label: 'White', color: '#ffffff' },
  { id: 'smoke', label: 'Smoke', color: '#1e2430' },
  { id: 'black', label: 'Black', color: '#090d16' },
  { id: 'rose', label: 'Rose', color: '#f43f5e' },
  { id: 'amber', label: 'Amber', color: '#f59e0b' },
  { id: 'emerald', label: 'Emerald', color: '#10b981' },
  { id: 'ocean', label: 'Ocean', color: '#3b82f6' },
  { id: 'purple', label: 'Purple', color: '#8b5cf6' }
];

const TEXT_COLOR_PRESETS = [
  { id: 'white', label: 'White', color: '#ffffff' },
  { id: 'dark', label: 'Dark', color: '#0f172a' },
  { id: 'rose', label: 'Rose', color: '#f43f5e' },
  { id: 'gold', label: 'Gold', color: '#f59e0b' },
  { id: 'emerald', label: 'Emerald', color: '#10b981' },
  { id: 'ocean', label: 'Ocean', color: '#3b82f6' },
  { id: 'purple', label: 'Purple', color: '#8b5cf6' },
  { id: 'silver', label: 'Silver', color: '#94a3b8' }
];

function getCardGlassStyleObj(card) {
  if (!card) return {};
  const gStyle = card.glassStyle || 'blur';
  const defaults = {
    frosted: { opacity: 25, blur: 10, tint: '#ffffff' },
    liquid: { opacity: 35, blur: 14, tint: '#ffffff' },
    translucent: { opacity: 15, blur: 8, tint: '#ffffff' },
    blur: { opacity: 68, blur: 16, tint: '#1e2430' }
  }[gStyle] || { opacity: 40, blur: 12, tint: '#ffffff' };

  const blurPx = card.glassBlur !== undefined ? card.glassBlur : defaults.blur;
  const opacityVal = card.glassOpacity !== undefined ? card.glassOpacity : defaults.opacity;
  const tintColor = card.glassTint || defaults.tint;
  const alpha = Math.max(0.02, Math.min(1, opacityVal / 100));

  let bg;
  if (gStyle === 'liquid') {
    bg = `linear-gradient(135deg, ${hexToRgba(tintColor, Math.min(1, alpha * 1.25))} 0%, ${hexToRgba(tintColor, alpha * 0.5)} 50%, ${hexToRgba(tintColor, Math.min(1, alpha * 0.95))} 100%)`;
  } else if (gStyle === 'blur') {
    bg = `linear-gradient(135deg, ${hexToRgba(tintColor, alpha * 0.9)} 0%, ${hexToRgba(tintColor, Math.min(1, alpha * 1.1))} 100%)`;
  } else if (gStyle === 'translucent') {
    bg = `linear-gradient(125deg, ${hexToRgba(tintColor, Math.min(1, alpha * 1.15))} 0%, ${hexToRgba(tintColor, alpha * 0.45)} 100%)`;
  } else {
    // frosted
    bg = hexToRgba(tintColor, alpha);
  }

  return {
    background: bg,
    backdropFilter: `blur(${blurPx}px)`,
    WebkitBackdropFilter: `blur(${blurPx}px)`
  };
}

const FONTS = [
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Olivia', label: 'Olivia' },
  { value: 'Playfair Display', label: 'Playfair' },
  { value: 'Outfit', label: 'Outfit' },
  { value: 'Pacifico', label: 'Pacifico' },
  { value: 'Caveat', label: 'Caveat' },
  { value: 'Impact', label: 'Impact' },
  { value: 'Courier New', label: 'Courier' }
];

// Target Connection Anchor Options (Top, Left, Auto Ray, Right, Bottom - No Corners)
const ANCHOR_OPTIONS = [
  { id: 'top', label: 'Top', icon: '↑', gridClass: 'btn-top' },
  { id: 'left', label: 'Left', icon: '←', gridClass: 'btn-left' },
  { id: 'auto', label: 'Auto Ray', icon: '✦', gridClass: 'btn-auto' },
  { id: 'right', label: 'Right', icon: '→', gridClass: 'btn-right' },
  { id: 'bottom', label: 'Bottom', icon: '↓', gridClass: 'btn-bottom' }
];

// Default Preset Size & Badge Categories
const SIZE_CATEGORIES = [
  {
    id: 'apparel',
    label: 'Apparel',
    sizes: ['XXS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', 'Free Size', 'One Size']
  },
  {
    id: 'numerical',
    label: 'Waist / Numbers',
    sizes: ['26', '28', '29', '30', '31', '32', '33', '34', '36', '38', '40', '42']
  },
  {
    id: 'shoes',
    label: 'Footwear & EU',
    sizes: ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46']
  },
  {
    id: 'badges',
    label: 'Product Badges',
    sizes: ['New', 'Hot', 'Best Seller', 'Sale', 'Chef Pick', 'Special', 'Oversize', '100% Cotton', 'WiFi', 'Studio']
  }
];

const CARD_THEME_COLORS = [
  { id: 'white', label: 'White', color: '#ffffff' },
  { id: 'dark', label: 'Dark', color: '#0f172a' },
  { id: 'rose', label: 'Rose', color: '#f43f5e' },
  { id: 'gold', label: 'Gold', color: '#f59e0b' },
  { id: 'cyan', label: 'Cyan', color: '#06b6d4' },
  { id: 'emerald', label: 'Emerald', color: '#10b981' },
  { id: 'violet', label: 'Violet', color: '#a855f7' }
];

const getCardThemeColor = (card) => {
  if (card?.themeColor) return card.themeColor;
  return card?.textColorMode === 'dark' ? '#0f172a' : '#ffffff';
};

const getCardGlassStroke = (card) => {
  if (card?.hasBorder === false) return 'transparent';
  const color = card?.themeColor || (card?.textColorMode === 'dark' ? '#0f172a' : '#ffffff');
  if (!color || color.toLowerCase() === '#ffffff' || color === 'white') {
    return 'rgba(255, 255, 255, 0.48)';
  }
  if (color === '#0f172a' || card?.textColorMode === 'dark') {
    return 'rgba(15, 23, 42, 0.55)';
  }
  let c = color.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  if (c.length === 6) {
    const num = parseInt(c, 16);
    return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, 0.65)`;
  }
  return color;
};

// Helper clamp function
const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

// Compute exact attachment point on card box (corners, edges or auto ray)
function getAnchorPoint(card, target, anchorMode = 'auto') {
  const cx = card.x;
  const cy = card.y;
  const halfW = card.width / 2;
  const halfH = card.height / 2;

  switch (anchorMode) {
    case 'tl':
      return { x: cx - halfW, y: cy - halfH, side: 'corner', arrow: '↘' };
    case 'tr':
      return { x: cx + halfW, y: cy - halfH, side: 'corner', arrow: '↙' };
    case 'bl':
      return { x: cx - halfW, y: cy + halfH, side: 'corner', arrow: '↗' };
    case 'br':
      return { x: cx + halfW, y: cy + halfH, side: 'corner', arrow: '↖' };
    case 'top': {
      const attachX = clamp(cx + (target.x - cx) * 0.4, cx - halfW * 0.65, cx + halfW * 0.65);
      return { x: attachX, y: cy - halfH, side: 'top', arrow: '▼' };
    }
    case 'bottom': {
      const attachX = clamp(cx + (target.x - cx) * 0.4, cx - halfW * 0.65, cx + halfW * 0.65);
      return { x: attachX, y: cy + halfH, side: 'bottom', arrow: '▲' };
    }
    case 'left': {
      const attachY = clamp(cy + (target.y - cy) * 0.35, cy - halfH * 0.58, cy + halfH * 0.58);
      return { x: cx - halfW, y: attachY, side: 'left', arrow: '▶' };
    }
    case 'right': {
      const attachY = clamp(cy + (target.y - cy) * 0.35, cy - halfH * 0.58, cy + halfH * 0.58);
      return { x: cx + halfW, y: attachY, side: 'right', arrow: '◀' };
    }
    case 'auto':
    default: {
      const dx = target.x - cx;
      const dy = target.y - cy;
      if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) {
        return { x: cx - halfW, y: cy, side: 'left', arrow: '▶' };
      }

      // Check if target is directly above or below card within center 35% horizontal span
      const isDirectlyAbove = dy < -halfH && Math.abs(dx) < halfW * 0.35;
      const isDirectlyBelow = dy > halfH && Math.abs(dx) < halfW * 0.35;

      if (isDirectlyAbove) {
        const attachX = clamp(cx + dx * 0.4, cx - halfW * 0.65, cx + halfW * 0.65);
        return { x: attachX, y: cy - halfH, side: 'top', arrow: '▼' };
      }

      if (isDirectlyBelow) {
        const attachX = clamp(cx + dx * 0.4, cx - halfW * 0.65, cx + halfW * 0.65);
        return { x: attachX, y: cy + halfH, side: 'bottom', arrow: '▲' };
      }

      // Dynamic Left / Right attachment as card or target moves:
      if (dx < 0) {
        // Target is to the LEFT: anchor sits on left border, arrow ▶ points into card
        const attachY = clamp(cy + dy * 0.35, cy - halfH * 0.58, cy + halfH * 0.58);
        return { x: cx - halfW, y: attachY, side: 'left', arrow: '▶' };
      } else {
        // Target is to the RIGHT: anchor sits on right border, arrow ◀ points into card
        const attachY = clamp(cy + dy * 0.35, cy - halfH * 0.58, cy + halfH * 0.58);
        return { x: cx + halfW, y: attachY, side: 'right', arrow: '◀' };
      }
    }
  }
}

// Compute path between anchor capsule and target pin (curved or straight line)
function getConnectorCurve(anchor, target, side = 'left', style = 'curved') {
  const ax = anchor.x;
  const ay = anchor.y;
  const tx = target.x;
  const ty = target.y;

  if (style === 'straight') {
    return {
      d: `M ${ax} ${ay} L ${tx} ${ty}`,
      isStraight: true,
      c1: { x: ax, y: ay },
      c2: { x: tx, y: ty }
    };
  }

  const dx = tx - ax;
  const dy = ty - ay;
  const dist = Math.hypot(dx, dy);
  const curvature = Math.min(Math.max(dist * 0.45, 6), 22);

  let c1x = ax;
  let c1y = ay;
  let c2x = tx;
  let c2y = ty;

  if (side === 'left') {
    // Leaves capsule horizontally to the left (away from card)
    c1x = ax - curvature;
    c1y = ay;
    // Approaching target smoothly
    c2x = tx + (ax > tx ? curvature * 0.25 : -curvature * 0.25);
    c2y = ay + (ty - ay) * 0.75;
  } else if (side === 'right') {
    // Leaves capsule horizontally to the right (away from card)
    c1x = ax + curvature;
    c1y = ay;
    // Approaching target smoothly
    c2x = tx + (ax < tx ? curvature * 0.25 : -curvature * 0.25);
    c2y = ay + (ty - ay) * 0.75;
  } else if (side === 'top') {
    c1x = ax;
    c1y = ay - curvature;
    c2x = ax + (tx - ax) * 0.75;
    c2y = ty + (ay > ty ? curvature * 0.25 : -curvature * 0.25);
  } else if (side === 'bottom') {
    c1x = ax;
    c1y = ay + curvature;
    c2x = ax + (tx - ax) * 0.75;
    c2y = ty + (ay < ty ? curvature * 0.25 : -curvature * 0.25);
  } else {
    c1x = ax + (dx < 0 ? -curvature : curvature) * 0.7;
    c1y = ay + (dy < 0 ? -curvature : curvature) * 0.7;
    c2x = tx;
    c2y = ty;
  }

  return {
    d: `M ${ax} ${ay} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${tx} ${ty}`,
    isStraight: false,
    c1: { x: c1x, y: c1y },
    c2: { x: c2x, y: c2y }
  };
}

// Render directional arrow SVG for the anchor capsule
function renderAnchorArrow(side, arrow) {
  if (side === 'top' || arrow === '▼') {
    return (
      <svg width="7" height="6" viewBox="0 0 7 6" fill="currentColor" className="ice-anchor-svg-arrow">
        <polygon points="0,1 7,1 3.5,6" />
      </svg>
    );
  }
  if (side === 'bottom' || arrow === '▲') {
    return (
      <svg width="7" height="6" viewBox="0 0 7 6" fill="currentColor" className="ice-anchor-svg-arrow">
        <polygon points="0,5 7,5 3.5,0" />
      </svg>
    );
  }
  if (side === 'left' || arrow === '▶') {
    return (
      <svg width="6" height="7" viewBox="0 0 6 7" fill="currentColor" className="ice-anchor-svg-arrow">
        <polygon points="1,0 6,3.5 1,7" />
      </svg>
    );
  }
  return (
    <svg width="6" height="7" viewBox="0 0 6 7" fill="currentColor" className="ice-anchor-svg-arrow">
      <polygon points="5,0 0,3.5 5,7" />
    </svg>
  );
}

export default function ImageCardEditor({
  imageUrl,
  imageFile,
  imageIndex,
  allImages = [],
  onSelectImageIndex,
  onUploadMoreImages,
  initialCards = null,
  onSave,
  onClose
}) {
  // Resilient image source with automatic fallback recovery from imageFile
  const [activeImageUrl, setActiveImageUrl] = useState(() => {
    if (imageUrl) return imageUrl;
    if (imageFile) {
      try {
        return URL.createObjectURL(imageFile);
      } catch {
        return '';
      }
    }
    return '';
  });

  useEffect(() => {
    if (imageUrl) {
      setActiveImageUrl(imageUrl);
    } else if (imageFile) {
      try {
        setActiveImageUrl(URL.createObjectURL(imageFile));
      } catch (err) {
        console.error('Failed to create object URL:', err);
      }
    }
  }, [imageUrl, imageFile]);

  // Robust error recovery: if current image fails to load, generate fresh URL from imageFile or FileReader
  const handleImageError = () => {
    console.warn('Image failed to load in ImageCardEditor, attempting recovery from imageFile...');
    if (imageFile) {
      try {
        const freshUrl = URL.createObjectURL(imageFile);
        setActiveImageUrl(freshUrl);
      } catch {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target.result) setActiveImageUrl(e.target.result);
        };
        reader.readAsDataURL(imageFile);
      }
    }
  };

  // Cards State (Supports Multiple Product Cards & Resumes Existing Cards)
  const [cards, setCards] = useState(() => {
    if (initialCards && Array.isArray(initialCards) && initialCards.length > 0) {
      return JSON.parse(JSON.stringify(initialCards));
    }
    return [
      {
        id: 'card_1',
        x: 64,
        y: 45,
        width: 28,
        height: 15,
        targetPos: { x: 26, y: 60 },
        hasTargetLine: true,
        targetAnchor: 'auto',
        lineStyle: 'straight',
        anchorStyle: 'circle',
        themeColor: '#ffffff',
        glassStyle: 'blur',
        fontFamily: 'Montserrat',
        textColorMode: 'light',
        titleText: 'Top',
        priceText: '76,000 MMK',
        priceAmount: '76,000',
        priceCurrency: 'MMK',
        isPrefixCurrency: false,
        hasDivider: false,
        hasSizes: true,
        sizesList: ['S', 'M', 'L', 'XL'],
        hasTag: false,
        tagText: '',
        hasCard: true,
        scale: 0.6
      }
    ];
  });
  const [selectedCardId, setSelectedCardId] = useState(() => {
    if (initialCards && Array.isArray(initialCards) && initialCards.length > 0) {
      return initialCards[0].id || 'card_1';
    }
    return 'card_1';
  });

  // Active selected card helper
  const activeCard = cards.find(c => c.id === selectedCardId) || cards[0] || {};

  // Card Content & Sizes Palette
  const [activeSizeCategory, setActiveSizeCategory] = useState('apparel');
  const [newSizeInput, setNewSizeInput] = useState('');

  // Reusable Saved Card Presets
  const [customTemplates, setCustomTemplates] = useState(() => {
    try {
      const saved = localStorage.getItem('ice_custom_card_templates');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [templateNameInput, setTemplateNameInput] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [isSavedFeedback, setIsSavedFeedback] = useState(false);
  const [previewCardDims, setPreviewCardDims] = useState({ w: 38, h: 44 });
  const previewCardRef = useRef(null);

  // Auto-Save Tracking
  const latestCardsRef = useRef(cards);
  latestCardsRef.current = cards;
  const isDirtyRef = useRef(false);
  const isAutoSavingRef = useRef(false);
  const hasPendingSaveRef = useRef(false);

  // 70% Height Studio Popup State
  const [isStudioPopupOpen, setIsStudioPopupOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('target'); // 'target' | 'content' | 'style' | 'templates'
  const [isPhotoPickerOpen, setIsPhotoPickerOpen] = useState(false);

  // Safe measurement of mini preview card dimensions (avoids setState in render callback)
  useEffect(() => {
    if (!isStudioPopupOpen || !previewCardRef.current) return;
    const el = previewCardRef.current;
    const parent = el.parentElement;
    if (!parent) return;

    const measure = () => {
      const r = el.getBoundingClientRect();
      const pr = parent.getBoundingClientRect();
      if (pr.width > 0 && pr.height > 0) {
        const pw = (r.width / pr.width) * 100;
        const ph = (r.height / pr.height) * 100;
        setPreviewCardDims(prev => {
          if (Math.abs((prev.w || 0) - pw) > 1 || Math.abs((prev.h || 0) - ph) > 1) {
            return { w: pw, h: ph };
          }
          return prev;
        });
      }
    };

    const id = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(id);
  }, [
    isStudioPopupOpen,
    activeTab,
    activeCard?.titleText,
    activeCard?.priceText,
    activeCard?.scale,
    activeCard?.hasSizes,
    activeCard?.sizesList
  ]);

  // Full Download Preview Lightbox State
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewDataUrl, setPreviewDataUrl] = useState(null);
  const [previewBlob, setPreviewBlob] = useState(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);

  // Refs for tracking drag/resize
  const workspaceRef = useRef(null);
  const imageRef = useRef(null);
  const dragActionRef = useRef(null);
  const cardElementsRef = useRef({});


  // Lock body scroll while editor is open (allow native touch-action inside sheet)
  useEffect(() => {
    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = origOverflow;
    };
  }, []);

  // Update the currently active card (only affects this selected card!)
  const updateActiveCard = useCallback((updates) => {
    const targetId = selectedCardId || (cards[0] && cards[0].id);
    setCards(prev => prev.map(c => {
      if (c.id === targetId) {
        return { ...c, ...updates };
      }
      return c;
    }));
  }, [selectedCardId, cards]);

  // Robust, instant toggle for switches (instant single-tap response with correct defaults)
  const toggleActiveCardKey = useCallback((key) => {
    const targetId = selectedCardId || (cards[0] && cards[0].id);
    const isDefaultTrue = ['hasBorder', 'hasCard', 'hasTargetLine', 'hasSizes'].includes(key);

    setCards(prev => prev.map(c => {
      if (c.id === targetId) {
        const curVal = isDefaultTrue ? (c[key] !== false) : !!c[key];
        return { ...c, [key]: !curVal };
      }
      return c;
    }));
  }, [selectedCardId, cards]);

  // Exact perimeter attachment calculator based on real DOM card bounding box
  const getCardPerimeterAnchor = useCallback((card) => {
    const el = cardElementsRef.current[card.id];
    let cardW = card.width || 20;
    let cardH = card.height || 12;
    if (el && workspaceRef.current) {
      const cr = el.getBoundingClientRect();
      const wr = workspaceRef.current.getBoundingClientRect();
      if (wr.width > 0 && wr.height > 0) {
        cardW = (cr.width / wr.width) * 100;
        cardH = (cr.height / wr.height) * 100;
      }
    }
    const fitted = { ...card, width: cardW, height: cardH };
    return getAnchorPoint(fitted, card.targetPos, card.targetAnchor);
  }, []);

  // Update specific card by ID
  const updateCardById = useCallback((id, updates) => {
    setCards(prev => prev.map(c => (c.id === id ? { ...c, ...updates } : c)));
  }, []);

  // Switch to another uploaded photo
  const handleSelectPhoto = async (targetIndex) => {
    if (targetIndex === imageIndex) {
      setIsPhotoPickerOpen(false);
      return;
    }
    // Auto-save current photo edits before switching
    try {
      const { blob } = await generateBakedBlob(cards);
      const fileName = (imageFile && imageFile.name) || `edited-image-${imageIndex + 1}.jpg`;
      const updatedFile = new File([blob], fileName, { type: blob.type || 'image/jpeg' });
      const updatedUrl = URL.createObjectURL(blob);
      if (onSave) {
        onSave({
          index: imageIndex,
          file: updatedFile,
          previewUrl: updatedUrl,
          cards: cards,
          baseImageUrl: activeImageUrl || imageUrl
        });
      }
    } catch (err) {
      console.warn('Auto-save on photo switch failed', err);
      if (onSave) {
        onSave({
          index: imageIndex,
          file: imageFile,
          previewUrl: activeImageUrl || imageUrl,
          cards: cards,
          baseImageUrl: activeImageUrl || imageUrl
        });
      }
    }
    setIsPhotoPickerOpen(false);
    if (onSelectImageIndex) {
      onSelectImageIndex(targetIndex);
    }
  };

  // Add a new card to photo (can add multiple cards!)
  const handleAddCard = () => {
    const idx = cards.length;
    const newCard = {
      id: `card_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      x: Math.min(78, 36 + (idx * 14)),
      y: Math.min(68, 28 + (idx * 16)),
      width: 28,
      height: 15,
      targetPos: {
        x: Math.max(16, 26 - (idx * 5)),
        y: Math.min(84, 55 + (idx * 10))
      },
      hasTargetLine: true,
      targetAnchor: 'auto',
      lineStyle: activeCard.lineStyle || 'straight',
      anchorStyle: activeCard.anchorStyle || 'circle',
      themeColor: activeCard.themeColor || '#ffffff',
      glassStyle: activeCard.glassStyle || 'blur',
      fontFamily: activeCard.fontFamily || 'Montserrat',
      textColorMode: activeCard.textColorMode || 'light',
      titleText: activeCard.titleText || 'Top',
      priceText: activeCard.priceText || '76,000 MMK',
      priceAmount: activeCard.priceAmount || '76,000',
      priceCurrency: activeCard.priceCurrency || 'MMK',
      isPrefixCurrency: false,
      hasDivider: false,
      hasSizes: true,
      sizesList: activeCard.sizesList && activeCard.sizesList.length > 0 ? [...activeCard.sizesList] : ['S', 'M', 'L', 'XL'],
      hasTag: false,
      tagText: '',
      hasCard: true,
      scale: activeCard.scale || 0.6
    };
    setCards(prev => [...prev, newCard]);
    setSelectedCardId(newCard.id);
  };

  // Delete a specific card
  const handleDeleteCard = (cardId, e) => {
    if (e) e.stopPropagation();
    if (cards.length <= 1) return;
    setCards(prev => {
      const remaining = prev.filter(c => c.id !== cardId);
      if (selectedCardId === cardId && remaining.length > 0) {
        setSelectedCardId(remaining[0].id);
      }
      return remaining;
    });
  };

  // Save current card as custom preset
  const handleSaveTemplate = (customName) => {
    const defaultName = activeCard.titleText
      ? `${activeCard.titleText} Design`
      : `Design ${customTemplates.length + 1}`;
    const name = (typeof customName === 'string' && customName.trim())
      ? customName.trim()
      : (templateNameInput.trim() || defaultName);

    const newTpl = {
      id: Date.now().toString(),
      name,
      glassStyle: activeCard.glassStyle,
      glassOpacity: activeCard.glassOpacity,
      glassBlur: activeCard.glassBlur,
      glassTint: activeCard.glassTint,
      textColor: activeCard.textColor,
      textColorMode: activeCard.textColorMode,
      themeColor: activeCard.themeColor,
      hasBorder: activeCard.hasBorder,
      fontFamily: activeCard.fontFamily,
      titleText: activeCard.titleText,
      priceText: activeCard.priceText,
      priceAmount: activeCard.priceAmount,
      priceCurrency: activeCard.priceCurrency,
      isPrefixCurrency: activeCard.isPrefixCurrency,
      hasDivider: activeCard.hasDivider,
      hasSizes: activeCard.hasSizes,
      sizesList: [...(activeCard.sizesList || [])],
      hasTag: activeCard.hasTag,
      tagText: activeCard.tagText,
      hasTargetLine: activeCard.hasTargetLine,
      targetAnchor: activeCard.targetAnchor,
      lineStyle: activeCard.lineStyle,
      scale: activeCard.scale,
      cardWidth: activeCard.width,
      cardHeight: activeCard.height
    };

    const updated = [newTpl, ...customTemplates];
    setCustomTemplates(updated);
    try {
      localStorage.setItem('ice_custom_card_templates', JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }

    setTemplateNameInput('');
    setSaveSuccessMsg(`Saved "${name}"!`);
    setTimeout(() => setSaveSuccessMsg(''), 2500);
  };

  const handleQuickSaveDesign = () => {
    handleSaveTemplate();
    setIsSavedFeedback(true);
    setTimeout(() => setIsSavedFeedback(false), 2000);
  };

  const handleDeleteTemplate = (id) => {
    const updated = customTemplates.filter(t => t.id !== id);
    setCustomTemplates(updated);
    try {
      localStorage.setItem('ice_custom_card_templates', JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage delete failed', e);
    }
  };

  // Toggle size on active card (instantly adds or removes from card)
  const handleToggleSize = (sz) => {
    const curSizes = activeCard.sizesList || [];
    if (curSizes.includes(sz)) {
      updateActiveCard({ sizesList: curSizes.filter(s => s !== sz) });
    } else {
      updateActiveCard({ sizesList: [...curSizes, sz] });
    }
  };

  const handleAddCustomSize = () => {
    const val = newSizeInput.trim();
    if (!val) return;
    const curSizes = activeCard.sizesList || [];
    if (!curSizes.includes(val)) {
      updateActiveCard({ sizesList: [...curSizes, val] });
    }
    setNewSizeInput('');
  };

  const handleRemoveActiveSize = (sz) => {
    const curSizes = activeCard.sizesList || [];
    updateActiveCard({ sizesList: curSizes.filter(s => s !== sz) });
  };

  const handleClearAllSizes = () => {
    updateActiveCard({ sizesList: [] });
  };

  // Apply template to active card only
  const applyTemplate = (tpl) => {
    updateActiveCard({
      ...(tpl.titleText !== undefined ? { titleText: tpl.titleText } : {}),
      ...(tpl.priceText !== undefined ? { priceText: tpl.priceText } : {}),
      ...(tpl.priceAmount !== undefined ? { priceAmount: tpl.priceAmount } : {}),
      ...(tpl.priceCurrency !== undefined ? { priceCurrency: tpl.priceCurrency } : {}),
      ...(tpl.isPrefixCurrency !== undefined ? { isPrefixCurrency: tpl.isPrefixCurrency } : {}),
      ...(tpl.hasDivider !== undefined ? { hasDivider: tpl.hasDivider } : {}),
      ...(tpl.hasSizes !== undefined ? { hasSizes: tpl.hasSizes } : {}),
      ...(tpl.sizesList ? { sizesList: [...tpl.sizesList] } : {}),
      ...(tpl.hasTag !== undefined ? { hasTag: tpl.hasTag } : {}),
      ...(tpl.tagText !== undefined ? { tagText: tpl.tagText } : {}),
      ...(tpl.hasTargetLine !== undefined ? { hasTargetLine: tpl.hasTargetLine } : {}),
      ...(tpl.targetAnchor ? { targetAnchor: tpl.targetAnchor } : {}),
      ...(tpl.lineStyle ? { lineStyle: tpl.lineStyle } : {}),
      ...(tpl.anchorStyle ? { anchorStyle: tpl.anchorStyle } : {}),
      ...(tpl.glassStyle ? { glassStyle: tpl.glassStyle } : {}),
      ...(tpl.glassOpacity !== undefined ? { glassOpacity: tpl.glassOpacity } : {}),
      ...(tpl.glassBlur !== undefined ? { glassBlur: tpl.glassBlur } : {}),
      ...(tpl.glassTint !== undefined ? { glassTint: tpl.glassTint } : {}),
      ...(tpl.textColor !== undefined ? { textColor: tpl.textColor } : {}),
      ...(tpl.textColorMode ? { textColorMode: tpl.textColorMode } : {}),
      ...(tpl.hasBorder !== undefined ? { hasBorder: tpl.hasBorder } : {}),
      ...(tpl.fontFamily ? { fontFamily: tpl.fontFamily } : {}),
      ...(tpl.themeColor ? { themeColor: tpl.themeColor } : {}),
      ...(tpl.scale !== undefined ? { scale: tpl.scale } : {}),
      ...(tpl.cardWidth && tpl.cardHeight ? { width: tpl.cardWidth, height: tpl.cardHeight } : {})
    });
  };

  // --- Pointer & Touch Dragging for Any Card ---
  const handleStartDrag = (e, type, cardId, handle = null) => {
    if (type === 'move' && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable)) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    setSelectedCardId(cardId);

    const targetCard = cards.find(c => c.id === cardId) || activeCard;
    const cardAnchor = getAnchorPoint(targetCard, targetCard.targetPos, targetCard.targetAnchor);

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    dragActionRef.current = {
      type,
      handle,
      cardId,
      startX: clientX,
      startY: clientY,
      origPos: {
        x: targetCard.x,
        y: targetCard.y,
        width: targetCard.width,
        height: targetCard.height,
        scale: targetCard.scale !== undefined ? targetCard.scale : 0.6,
        aspectRatio: targetCard.width / Math.max(1, targetCard.height),
        targetX: targetCard.targetPos.x,
        targetY: targetCard.targetPos.y,
        anchorX: cardAnchor.x,
        anchorY: cardAnchor.y
      }
    };

    window.addEventListener('mousemove', handleMoveDrag, { passive: false });
    window.addEventListener('mouseup', handleEndDrag);
    window.addEventListener('touchmove', handleMoveDrag, { passive: false });
    window.addEventListener('touchend', handleEndDrag);
  };

  const handleMoveDrag = useCallback((e) => {
    if (!dragActionRef.current || !workspaceRef.current) return;
    if (e.cancelable) e.preventDefault();

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const targetEl = imageRef.current || workspaceRef.current;
    if (!targetEl) return;
    const rect = targetEl.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const dxPx = clientX - dragActionRef.current.startX;
    const dyPx = clientY - dragActionRef.current.startY;

    const dxPct = (dxPx / rect.width) * 100;
    const dyPct = (dyPx / rect.height) * 100;

    const { type, handle, cardId, origPos } = dragActionRef.current;

    setCards(prev => prev.map(c => {
      if (c.id !== cardId) return c;

      if (type === 'move') {
        const halfW = origPos.width / 2;
        const halfH = origPos.height / 2;
        const newX = clamp(origPos.x + dxPct, halfW, 100 - halfW);
        const newY = clamp(origPos.y + dyPct, halfH, 100 - halfH);
        return {
          ...c,
          x: Math.round(newX * 10) / 10,
          y: Math.round(newY * 10) / 10
        };
      } else if (type === 'resize') {
        const origScale = origPos.scale !== undefined ? origPos.scale : 0.6;
        let deltaScale = 0;
        if (handle === 'se') deltaScale = (dxPx + dyPx) / 160;
        else if (handle === 'sw') deltaScale = (-dxPx + dyPx) / 160;
        else if (handle === 'ne') deltaScale = (dxPx - dyPx) / 160;
        else if (handle === 'nw') deltaScale = (-dxPx - dyPx) / 160;
        else deltaScale = (dxPx + dyPx) / 160;

        const newScale = clamp(Math.round((origScale + deltaScale) * 100) / 100, 0.55, 1.85);
        return {
          ...c,
          scale: newScale
        };
      } else if (type === 'target') {
        const newX = clamp(origPos.targetX + dxPct, 2, 98);
        const newY = clamp(origPos.targetY + dyPct, 2, 98);
        return {
          ...c,
          targetPos: {
            x: Math.round(newX * 10) / 10,
            y: Math.round(newY * 10) / 10
          }
        };
      } else if (type === 'anchor') {
        const curX = origPos.anchorX + dxPct;
        const curY = origPos.anchorY + dyPct;
        const offX = curX - origPos.x;
        const offY = curY - origPos.y;
        const halfW = origPos.width / 2;
        const halfH = origPos.height / 2;
        const normX = offX / Math.max(1, halfW);
        const normY = offY / Math.max(1, halfH);

        let newAnchor = 'auto';
        if (Math.abs(normX) > Math.abs(normY)) {
          newAnchor = normX < 0 ? 'left' : 'right';
        } else {
          newAnchor = normY < 0 ? 'top' : 'bottom';
        }
        return {
          ...c,
          targetAnchor: newAnchor
        };
      }
      return c;
    }));
  }, []);

  const handleEndDrag = useCallback(() => {
    dragActionRef.current = null;
    window.removeEventListener('mousemove', handleMoveDrag);
    window.removeEventListener('mouseup', handleEndDrag);
    window.removeEventListener('touchmove', handleMoveDrag);
    window.removeEventListener('touchend', handleEndDrag);
  }, [handleMoveDrag]);

  // Two-Finger Pinch-to-Zoom Gesture for Direct Mobile Card Resizing
  const handlePinchMove = useCallback((e) => {
    if (!dragActionRef.current || dragActionRef.current.type !== 'pinch') return;
    if (e.touches.length < 2) return;
    if (e.cancelable) e.preventDefault();

    const dist = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    );
    const { cardId, startDist, origScale } = dragActionRef.current;
    if (startDist <= 0) return;

    const ratio = dist / startDist;
    const newScale = clamp(Math.round((origScale * ratio) * 100) / 100, 0.55, 1.85);
    setCards(prev => prev.map(c => c.id === cardId ? { ...c, scale: newScale } : c));
  }, []);

  const handlePinchEnd = useCallback(() => {
    if (dragActionRef.current && dragActionRef.current.type === 'pinch') {
      dragActionRef.current = null;
    }
    window.removeEventListener('touchmove', handlePinchMove);
    window.removeEventListener('touchend', handlePinchEnd);
  }, [handlePinchMove]);

  useEffect(() => {
    return () => {
      window.removeEventListener('mousemove', handleMoveDrag);
      window.removeEventListener('mouseup', handleEndDrag);
      window.removeEventListener('touchmove', handleMoveDrag);
      window.removeEventListener('touchend', handleEndDrag);
      window.removeEventListener('touchmove', handlePinchMove);
      window.removeEventListener('touchend', handlePinchEnd);
    };
  }, [handleMoveDrag, handleEndDrag, handlePinchMove, handlePinchEnd]);

  // When bottom sheet popup opens, immediately detach any active window drag listeners
  // and clear drag states so mobile taps inside the studio sheet respond instantly
  useEffect(() => {
    if (isStudioPopupOpen) {
      dragActionRef.current = null;
      window.removeEventListener('mousemove', handleMoveDrag);
      window.removeEventListener('mouseup', handleEndDrag);
      window.removeEventListener('touchmove', handleMoveDrag);
      window.removeEventListener('touchend', handleEndDrag);
      window.removeEventListener('touchmove', handlePinchMove);
      window.removeEventListener('touchend', handlePinchEnd);
    }
  }, [isStudioPopupOpen, handleMoveDrag, handleEndDrag, handlePinchMove, handlePinchEnd]);

  const handleReset = () => {
    setCards([
      {
        id: 'card_1',
        x: 64,
        y: 45,
        width: 28,
        height: 15,
        targetPos: { x: 26, y: 60 },
        hasTargetLine: true,
        targetAnchor: 'auto',
        lineStyle: 'straight',
        anchorStyle: 'circle',
        themeColor: '#ffffff',
        glassStyle: 'blur',
        fontFamily: 'Montserrat',
        textColorMode: 'light',
        titleText: 'Top',
        priceText: '76,000 MMK',
        priceAmount: '76,000',
        priceCurrency: 'MMK',
        isPrefixCurrency: false,
        hasDivider: false,
        hasSizes: true,
        sizesList: ['S', 'M', 'L', 'XL'],
        hasTag: false,
        tagText: '',
        hasCard: true,
        scale: 0.6
      }
    ]);
    setSelectedCardId('card_1');
    setIsStudioPopupOpen(false);
  };

  // --- High-Resolution Canvas Bake Helper (Draws ALL Cards) ---
  const generateBakedBlob = async (cardsToBake = cards) => {
    const srcToUse = activeImageUrl || imageUrl;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = srcToUse;

    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = () => {
        const fallbackImg = new Image();
        fallbackImg.onload = () => resolve(fallbackImg);
        fallbackImg.onerror = reject;
        fallbackImg.src = srcToUse;
      };
    });

    try {
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
    } catch {
      // ignore
    }

    const natW = img.naturalWidth || img.width;
    const natH = img.naturalHeight || img.height;

    const screenW = (workspaceRef.current && workspaceRef.current.clientWidth) || (imageRef.current && imageRef.current.clientWidth) || 400;

    const canvas = document.createElement('canvas');
    canvas.width = natW;
    canvas.height = natH;
    const ctx = canvas.getContext('2d');

    // 1. Draw base photo
    ctx.drawImage(img, 0, 0, natW, natH);

    // 2. Draw all cards using unified renderer
    if (cardsToBake && cardsToBake.length > 0) {
      drawCardsOnCanvas(ctx, img, natW, natH, cardsToBake, screenW);
    }

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Canvas blob generation failed'));
          return;
        }
        const dataUrl = URL.createObjectURL(blob);
        resolve({ blob, dataUrl });
      }, (imageFile && imageFile.type) || 'image/jpeg', 0.95);
    });
  };

  // Perform Auto-Save whenever user edits cards
  const performAutoSave = useCallback(async (cardsToSave) => {
    const currentCards = cardsToSave || latestCardsRef.current;
    if (!onSave) return;

    if (currentCards.length === 0) {
      onSave({
        index: imageIndex,
        file: imageFile,
        previewUrl: activeImageUrl || imageUrl,
        cards: [],
        baseImageUrl: activeImageUrl || imageUrl
      });
      isDirtyRef.current = false;
      return;
    }

    if (isAutoSavingRef.current) {
      hasPendingSaveRef.current = true;
      return;
    }

    isAutoSavingRef.current = true;

    try {
      const { blob } = await generateBakedBlob(currentCards);
      const fileName = (imageFile && imageFile.name) || `edited-image-${imageIndex + 1}.jpg`;
      const updatedFile = new File([blob], fileName, { type: blob.type || 'image/jpeg' });
      const updatedUrl = URL.createObjectURL(blob);

      onSave({
        index: imageIndex,
        file: updatedFile,
        previewUrl: updatedUrl,
        cards: currentCards,
        baseImageUrl: activeImageUrl || imageUrl
      });
      isDirtyRef.current = false;
    } catch (err) {
      console.error('Auto-save failed:', err);
    } finally {
      isAutoSavingRef.current = false;
      if (hasPendingSaveRef.current) {
        hasPendingSaveRef.current = false;
        performAutoSave(latestCardsRef.current);
      }
    }
  }, [imageIndex, imageFile, activeImageUrl, imageUrl, onSave]);

  // Debounced Auto-Save on any card mutation
  useEffect(() => {
    isDirtyRef.current = true;
    const timer = setTimeout(() => {
      performAutoSave(cards);
    }, 450);

    return () => clearTimeout(timer);
  }, [cards, performAutoSave]);

  // Handle Back: ensures any pending edits are baked and saved before closing
  const handleBack = async () => {
    if (isDirtyRef.current) {
      try {
        await performAutoSave(latestCardsRef.current);
      } catch (e) {
        console.error('Save on exit failed:', e);
      }
    }
    onClose();
  };

  // Open Full Download Preview Modal
  const handleOpenFinalPreview = async () => {
    if (isGeneratingPreview) return;
    setIsGeneratingPreview(true);
    try {
      const { blob, dataUrl } = await generateBakedBlob();
      setPreviewBlob(blob);
      setPreviewDataUrl(dataUrl);
      setIsPreviewModalOpen(true);
    } catch (err) {
      console.error('Failed to generate preview:', err);
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  // Direct Download from Preview Modal
  const handleDownloadPreview = () => {
    if (!previewDataUrl) return;
    const a = document.createElement('a');
    a.href = previewDataUrl;
    const originalName = (imageFile && imageFile.name) || `photo-${imageIndex + 1}.jpg`;
    const downloadName = originalName.replace(/\.[^/.]+$/, '') + '-with-cards.png';
    a.download = downloadName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Active Card Preview line & anchor geometry for the bottom sheet preview
  const activeAnchor = getAnchorPoint(activeCard, activeCard.targetPos, activeCard.targetAnchor);
  const activeThemeColor = getCardThemeColor(activeCard);
  const previewSide = activeCard.targetAnchor === 'auto' ? (activeAnchor.side || 'left') : activeCard.targetAnchor;
  const isStraightPreview = activeCard.lineStyle === 'straight';

  // Calculate target area focus coordinates in photo percentage
  const targetX = activeCard.targetPos?.x ?? 50;
  const targetY = activeCard.targetPos?.y ?? 50;
  const cardX = activeCard.x ?? 50;
  const cardY = activeCard.y ?? 50;
  const previewFocusX = clamp(Math.round((targetX * 0.6) + (cardX * 0.4)), 0, 100);
  const previewFocusY = clamp(Math.round((targetY * 0.6) + (cardY * 0.4)), 0, 100);

  const pCardW = previewCardDims.w || 38;
  const pCardH = previewCardDims.h || 44;
  let pAnchor = { x: 50 - (pCardW / 2), y: 50, side: 'left' };
  let pTarget = { x: Math.max(6, 50 - (pCardW / 2) - 18), y: 76 };
  let pPath = isStraightPreview 
    ? `M ${pAnchor.x} ${pAnchor.y} L ${pTarget.x} ${pTarget.y}`
    : `M ${pAnchor.x} ${pAnchor.y} C ${pAnchor.x - 12} ${pAnchor.y}, ${pTarget.x} 64, ${pTarget.x} ${pTarget.y}`;

  if (previewSide === 'right') {
    pAnchor = { x: 50 + (pCardW / 2), y: 50, side: 'right' };
    pTarget = { x: Math.min(94, 50 + (pCardW / 2) + 18), y: 76 };
    pPath = isStraightPreview 
      ? `M ${pAnchor.x} ${pAnchor.y} L ${pTarget.x} ${pTarget.y}`
      : `M ${pAnchor.x} ${pAnchor.y} C ${pAnchor.x + 12} ${pAnchor.y}, ${pTarget.x} 64, ${pTarget.x} ${pTarget.y}`;
  } else if (previewSide === 'top') {
    pAnchor = { x: 50, y: 50 - (pCardH / 2), side: 'top' };
    pTarget = { x: 26, y: 12 };
    pPath = isStraightPreview 
      ? `M ${pAnchor.x} ${pAnchor.y} L ${pTarget.x} ${pTarget.y}`
      : `M ${pAnchor.x} ${pAnchor.y} C 50 ${pAnchor.y - 10}, 36 12, ${pTarget.x} ${pTarget.y}`;
  } else if (previewSide === 'bottom') {
    pAnchor = { x: 50, y: 50 + (pCardH / 2), side: 'bottom' };
    pTarget = { x: 26, y: 88 };
    pPath = isStraightPreview 
      ? `M ${pAnchor.x} ${pAnchor.y} L ${pTarget.x} ${pTarget.y}`
      : `M ${pAnchor.x} ${pAnchor.y} C 50 ${pAnchor.y + 10}, 36 88, ${pTarget.x} ${pTarget.y}`;
  }

  return (
    <div className="watermark-studio-page ice-subpage animate-fade-in">
      {/* ============================================================ */}
      {/* TOP BAR: BACK BUTTON, STATUS CAPSULE & RESET                 */}
      {/* ============================================================ */}
      <div className="watermark-studio-header" style={{ justifyContent: 'space-between', marginBottom: '0.65rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            className="btn btn-glass btn-icon-only"
            onClick={handleBack}
            title="Back to Watermark Studio"
          >
            <ArrowLeft size={16} />
          </button>

          <div className="insta-header-capsule" style={{ margin: 0 }}>
            <Sparkles size={13} className="insta-capsule-icon" />
            <span>Glass Card Studio ({cards.length} {cards.length === 1 ? 'Card' : 'Cards'})</span>
          </div>
        </div>

        <button
          className="btn btn-glass btn-icon-only"
          onClick={handleReset}
          title="Reset Cards to Default"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* ============================================================ */}
      {/* WORKSPACE CANVAS (RENDERS ALL CARDS)                         */}
      {/* ============================================================ */}
      <div className="ice-canvas-container">
        <div
          className="insta-image-wrapper"
          ref={workspaceRef}
        >
          {/* Base photo (Full original width, edge-to-edge) */}
          <img
            ref={imageRef}
            src={activeImageUrl || imageUrl}
            alt="Workspace Canvas"
            className="insta-base-img"
            draggable={false}
            onError={handleImageError}
          />

          {/* Render All Cards on Photo */}
          {cards.map((card) => {
            if (!card.hasCard) return null;
            const isSelected = card.id === activeCard.id;
            const cardAnchor = getCardPerimeterAnchor(card);
            const cardCurve = getConnectorCurve(cardAnchor, card.targetPos, cardAnchor.side, card.lineStyle || 'curved');
            const cardThemeColor = getCardThemeColor(card);

            return (
              <React.Fragment key={card.id}>
                {/* Target Pointer Vector Line (Sleek Luxury Callout with Ambient Shadow) */}
                {card.hasTargetLine && (
                  <svg
                    className="ice-pointer-svg-layer"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <filter id={`line-soft-shadow-${card.id}`} x="-30%" y="-30%" width="160%" height="160%">
                        <feDropShadow dx="0" dy="1" stdDeviation="1.2" floodColor="rgba(0, 0, 0, 0.45)" />
                      </filter>
                    </defs>
                    <path
                      d={cardCurve.d}
                      fill="none"
                      stroke={cardThemeColor}
                      strokeWidth="1.35"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      vectorEffect="non-scaling-stroke"
                      filter={`url(#line-soft-shadow-${card.id})`}
                    />
                  </svg>
                )}

                {/* Target Pin (Precision Luminous Dot in Theme Color) */}
                {card.hasTargetLine && (
                  <div
                    className="ice-target-pin"
                    style={{
                      left: `${card.targetPos.x}%`,
                      top: `${card.targetPos.y}%`,
                      '--card-theme-color': cardThemeColor
                    }}
                    onMouseDown={(e) => handleStartDrag(e, 'target', card.id)}
                    onTouchStart={(e) => handleStartDrag(e, 'target', card.id)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCardId(card.id);
                    }}
                    title="Drag target pin to point at product"
                  >
                    <div className="ice-pin-inner-core" />
                  </div>
                )}

                {/* Draggable Glass Card with Auto-Fit Width to Text (Seamless Line Junction) */}
                <div
                  ref={(el) => {
                    if (el) cardElementsRef.current[card.id] = el;
                  }}
                  id={`ice-card-${card.id}`}
                  className={`ice-card glass-${card.glassStyle} text-mode-${card.textColorMode} ${card.hasBorder === false ? 'no-border' : 'has-glass-border'} ${isSelected ? 'is-active-card' : ''}`}
                  style={{
                    left: `${card.x}%`,
                    top: `${card.y}%`,
                    width: 'max-content',
                    maxWidth: '88%',
                    height: 'auto',
                    '--cscale': card.scale !== undefined ? card.scale : 0.6,
                    '--card-theme-color': cardThemeColor,
                    '--card-glass-stroke': getCardGlassStroke(card),
                    '--card-custom-text': card.textColor || (card.textColorMode === 'dark' ? '#0f172a' : '#ffffff'),
                    fontFamily: card.fontFamily,
                    ...getCardGlassStyleObj(card)
                  }}
                  onMouseDown={(e) => handleStartDrag(e, 'move', card.id)}
                  onTouchStart={(e) => {
                    if (e.touches.length === 2) {
                      e.preventDefault();
                      e.stopPropagation();
                      const dist = Math.hypot(
                        e.touches[0].clientX - e.touches[1].clientX,
                        e.touches[0].clientY - e.touches[1].clientY
                      );
                      dragActionRef.current = {
                        type: 'pinch',
                        cardId: card.id,
                        startDist: dist,
                        origScale: card.scale !== undefined ? card.scale : 0.6
                      };
                      window.addEventListener('touchmove', handlePinchMove, { passive: false });
                      window.addEventListener('touchend', handlePinchEnd);
                    } else {
                      handleStartDrag(e, 'move', card.id);
                    }
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCardId(card.id);
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setSelectedCardId(card.id);
                    setIsStudioPopupOpen(true);
                  }}
                  title="Drag card to move • Drag corner to resize • Pinch to scale"
                >
                  {/* Top-Right Corner Action Bar: Sleek Edit & Delete Buttons */}
                  <div className="ice-card-corner-actions" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className="ice-card-corner-btn edit-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCardId(card.id);
                        setIsStudioPopupOpen(true);
                      }}
                      title="Edit this card's content, style & target"
                    >
                      <Edit3 size={11} />
                      <span>Edit</span>
                    </button>
                    {cards.length > 1 && (
                      <button
                        type="button"
                        className="ice-card-corner-btn del-btn"
                        onClick={(e) => handleDeleteCard(card.id, e)}
                        title="Delete this card"
                      >
                        <Trash2 size={11} />
                      </button>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="ice-card-body">
                    {card.hasTag && card.tagText && (
                      <div className="ice-tag-row">
                        <span className="ice-card-badge">
                          {card.tagText}
                        </span>
                      </div>
                    )}

                    <h4 className="ice-card-title ice-card-heading">
                      {card.titleText}
                    </h4>

                    <div className="ice-card-price ice-card-cost">
                      {(() => {
                        const { amount, currency, isPrefix } = parseCardPrice(card);
                        if (isPrefix && currency) {
                          return (
                            <>
                              <span className="ice-price-curr prefix">{currency}</span>
                              <span className="ice-price-num">{amount}</span>
                            </>
                          );
                        }
                        return (
                          <>
                            <span className="ice-price-num">{amount}</span>
                            {currency && <span className="ice-price-curr suffix">{currency}</span>}
                          </>
                        );
                      })()}
                    </div>

                    {card.hasDivider && <div className="ice-card-divider" />}

                    {card.hasSizes && card.sizesList && card.sizesList.length > 0 && (
                      <div className="ice-sizes-row">
                        {card.sizesList.map((sz, idx) => (
                          <span
                            key={idx}
                            className="ice-size-pill"
                            title="Available size badge"
                          >
                            {sz}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Touch & Finger Corner Resize Grips (SE, SW, NE, NW) */}
                  <div
                    className="ice-handle ice-handle-se"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      handleStartDrag(e, 'resize', card.id, 'se');
                    }}
                    onTouchStart={(e) => {
                      e.stopPropagation();
                      handleStartDrag(e, 'resize', card.id, 'se');
                    }}
                    title="Drag corner with finger to resize card"
                  >
                    <div className="ice-handle-bracket" />
                  </div>

                  <div
                    className="ice-handle ice-handle-sw"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      handleStartDrag(e, 'resize', card.id, 'sw');
                    }}
                    onTouchStart={(e) => {
                      e.stopPropagation();
                      handleStartDrag(e, 'resize', card.id, 'sw');
                    }}
                    title="Drag corner with finger to resize card"
                  >
                    <div className="ice-handle-bracket" />
                  </div>

                  <div
                    className="ice-handle ice-handle-ne"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      handleStartDrag(e, 'resize', card.id, 'ne');
                    }}
                    onTouchStart={(e) => {
                      e.stopPropagation();
                      handleStartDrag(e, 'resize', card.id, 'ne');
                    }}
                    title="Drag corner with finger to resize card"
                  >
                    <div className="ice-handle-bracket" />
                  </div>

                  <div
                    className="ice-handle ice-handle-nw"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      handleStartDrag(e, 'resize', card.id, 'nw');
                    }}
                    onTouchStart={(e) => {
                      e.stopPropagation();
                      handleStartDrag(e, 'resize', card.id, 'nw');
                    }}
                    title="Drag corner with finger to resize card"
                  >
                    <div className="ice-handle-bracket" />
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 70% HEIGHT iOS CARD & TARGET STUDIO POPUP                    */}
      {/* ============================================================ */}
      {isStudioPopupOpen && createPortal(
        <>
          {/* Dimmed backdrop overlay */}
          <div
            className="ios-sheet-backdrop"
            onClick={() => setIsStudioPopupOpen(false)}
          />

          {/* 70% Height Bottom Sheet Modal */}
          <div
            className="ios-bottom-sheet-70 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Grabber handle */}
            <div className="ios-sheet-handle" />

            {/* Card selector when multiple cards exist */}
            {cards.length > 1 && (
              <div className="ios-sheet-header-centered" style={{ marginBottom: '8px' }}>
                <div className="ios-sheet-card-selector-row">
                  {cards.map((c, idx) => (
                    <button
                      key={c.id}
                      type="button"
                      className={`ios-card-chip ${c.id === activeCard.id ? 'active' : ''}`}
                      onClick={() => setSelectedCardId(c.id)}
                    >
                      <span>#{idx + 1} {c.titleText || 'Item'}</span>
                    </button>
                  ))}
                  <button
                    type="button"
                    className="ios-card-chip add-chip"
                    onClick={handleAddCard}
                    title="Add another card"
                  >
                    <Plus size={11} />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            )}

            {/* Live Card & Connection Line Preview Showcase */}
            <div className="ios-sheet-preview-wrapper">
              <div className="ios-sheet-card-showcase-stage">
                {/* Real Target Area Photo Background (Original Crisp Photo) */}
                {(activeImageUrl || imageUrl) && (
                  <div className="ios-preview-photo-viewport">
                    <img
                      src={activeImageUrl || imageUrl}
                      alt="Edit Target Area"
                      className="ios-preview-photo-img"
                      style={{
                        objectPosition: `${previewFocusX}% ${previewFocusY}%`
                      }}
                    />
                    <div className="ios-preview-photo-badge">
                      <Target size={11} />
                      <span>Target Focus</span>
                    </div>
                  </div>
                )}

                {/* Preview Connection Line (Sleek Luxury Callout) */}
                {activeCard.hasTargetLine && (
                  <svg
                    className="ios-preview-svg"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <filter id="preview-line-soft-shadow" x="-30%" y="-30%" width="160%" height="160%">
                        <feDropShadow dx="0" dy="1" stdDeviation="1.2" floodColor="rgba(0, 0, 0, 0.45)" />
                      </filter>
                    </defs>
                    <path
                      d={pPath}
                      fill="none"
                      stroke={activeThemeColor}
                      strokeWidth="1.35"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      vectorEffect="non-scaling-stroke"
                      filter="url(#preview-line-soft-shadow)"
                    />
                  </svg>
                )}

                {/* Preview Target Pin (Precision Luminous Dot) */}
                {activeCard.hasTargetLine && (
                  <div
                    className="ice-target-pin"
                    style={{
                      left: `${pTarget.x}%`,
                      top: `${pTarget.y}%`,
                      transform: 'translate(-50%, -50%)',
                      '--card-theme-color': activeThemeColor
                    }}
                  >
                    <div className="ice-pin-inner-core" />
                  </div>
                )}

                {/* Centered Glass Card with Auto-Fit Width */}
                <div
                  ref={previewCardRef}
                  className={`ice-card glass-${activeCard.glassStyle} text-mode-${activeCard.textColorMode} ${activeCard.hasBorder === false ? 'no-border' : 'has-glass-border'} ios-preview-glass-card`}
                  style={{
                    width: 'max-content',
                    maxWidth: '78%',
                    height: 'auto',
                    '--cscale': (activeCard.scale !== undefined ? activeCard.scale : 0.6) * 0.95,
                    '--card-theme-color': activeThemeColor,
                    '--card-glass-stroke': getCardGlassStroke(activeCard),
                    '--card-custom-text': activeCard.textColor || (activeCard.textColorMode === 'dark' ? '#0f172a' : '#ffffff'),
                    fontFamily: activeCard.fontFamily,
                    ...getCardGlassStyleObj(activeCard)
                  }}
                >
                  <div className="ice-card-body">
                    {activeCard.hasTag && activeCard.tagText && (
                      <div className="ice-tag-row">
                        <span className="ice-card-badge">
                          {activeCard.tagText}
                        </span>
                      </div>
                    )}
                    <h4 className="ice-card-title ice-card-heading">
                      {activeCard.titleText || 'Title'}
                    </h4>
                    <div className="ice-card-price ice-card-cost">
                      {(() => {
                        const { amount, currency, isPrefix } = parseCardPrice(activeCard);
                        if (isPrefix && currency) {
                          return (
                            <>
                              <span className="ice-price-curr prefix">{currency}</span>
                              <span className="ice-price-num">{amount}</span>
                            </>
                          );
                        }
                        return (
                          <>
                            <span className="ice-price-num">{amount}</span>
                            {currency && <span className="ice-price-curr suffix">{currency}</span>}
                          </>
                        );
                      })()}
                    </div>
                    {activeCard.hasDivider && <div className="ice-card-divider" />}
                    {activeCard.hasSizes && activeCard.sizesList && activeCard.sizesList.length > 0 && (
                      <div className="ice-sizes-row">
                        {activeCard.sizesList.map(sz => (
                          <span
                            key={sz}
                            className="ice-size-pill"
                          >
                            {sz}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Tab navigation pills */}
            <div className="ios-sheet-tabs-bar">
              <button
                type="button"
                className={`ios-sheet-tab-btn ${activeTab === 'target' ? 'active' : ''}`}
                onClick={() => setActiveTab('target')}
              >
                <Target size={14} />
                <span>Target & Anchor</span>
              </button>
              <button
                type="button"
                className={`ios-sheet-tab-btn ${activeTab === 'content' ? 'active' : ''}`}
                onClick={() => setActiveTab('content')}
              >
                <Edit3 size={14} />
                <span>Content</span>
              </button>
              <button
                type="button"
                className={`ios-sheet-tab-btn ${activeTab === 'style' ? 'active' : ''}`}
                onClick={() => setActiveTab('style')}
              >
                <Palette size={14} />
                <span>Design</span>
              </button>
              <button
                type="button"
                className={`ios-sheet-tab-btn ${activeTab === 'templates' ? 'active' : ''}`}
                onClick={() => setActiveTab('templates')}
              >
                <Bookmark size={14} />
                <span>Templates</span>
              </button>
            </div>

            {/* Scrollable content body */}
            <div className="ios-sheet-scrollable-body">
              {/* TAB 1: TARGET & ANCHOR */}
              {activeTab === 'target' && (
                <div className="ios-sheet-content">
                  <div className="ios-sheet-group-card">
                    <div
                      className="ios-sheet-group-row ios-sheet-row-toggle"
                      onClick={() => toggleActiveCardKey('hasCard')}
                      role="button"
                      tabIndex={0}
                    >
                      <span className="ios-sheet-label">Show Glass Card</span>
                      <div
                        className={`ios-switch ${activeCard.hasCard !== false ? 'on' : ''}`}
                        role="switch"
                        aria-checked={activeCard.hasCard !== false}
                      >
                        <div className="ios-switch-thumb" />
                      </div>
                    </div>
                    <div className="ios-sheet-group-divider" />
                    <div
                      className="ios-sheet-group-row ios-sheet-row-toggle"
                      onClick={() => toggleActiveCardKey('hasTargetLine')}
                      role="button"
                      tabIndex={0}
                    >
                      <span className="ios-sheet-label">Target Pointer Line</span>
                      <div
                        className={`ios-switch ${activeCard.hasTargetLine !== false ? 'on' : ''}`}
                        role="switch"
                        aria-checked={activeCard.hasTargetLine !== false}
                      >
                        <div className="ios-switch-thumb" />
                      </div>
                    </div>
                  </div>

                  {activeCard.hasTargetLine && (
                    <div className="ios-sheet-group-card" style={{ padding: '14px' }}>
                      <div className="ios-anchor-header">
                        <span className="ios-sheet-label" style={{ fontSize: '0.85rem' }}>
                          Box Connection Anchor
                        </span>
                        <span className="ios-sheet-hint-tag">
                          {ANCHOR_OPTIONS.find(o => o.id === activeCard.targetAnchor)?.label || 'Auto'}
                        </span>
                      </div>
                      <p className="ios-sheet-field-desc">
                        Select connection edge (Top, Left, Right, Bottom) or Auto Ray:
                      </p>

                      {/* 5-Direction Compass Grid (No Corners) */}
                      <div className="target-anchor-compass-grid">
                        {ANCHOR_OPTIONS.map(opt => {
                          const isSelected = activeCard.targetAnchor === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              className={`target-anchor-btn ${opt.gridClass || ''} ${isSelected ? 'active' : ''}`}
                              onClick={() => updateActiveCard({ targetAnchor: opt.id })}
                            >
                              <span className="target-anchor-icon">{opt.icon}</span>
                              <span className="target-anchor-text">{opt.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {activeCard.hasTargetLine && (
                    <div className="ios-sheet-group-card" style={{ padding: '14px', marginTop: '10px' }}>
                      <div className="ios-anchor-header">
                        <span className="ios-sheet-label" style={{ fontSize: '0.85rem' }}>
                          Pointer Line Style
                        </span>
                        <span className="ios-sheet-hint-tag">
                          {activeCard.lineStyle === 'straight' ? 'Straight Line' : 'Curved Wave'}
                        </span>
                      </div>
                      <p className="ios-sheet-field-desc">
                        Choose curved organic wave or direct straight line:
                      </p>

                      <div className="ice-line-style-selector">
                        <button
                          type="button"
                          className={`ice-line-style-btn ${activeCard.lineStyle !== 'straight' ? 'active' : ''}`}
                          onClick={() => updateActiveCard({ lineStyle: 'curved' })}
                        >
                          <svg width="22" height="14" viewBox="0 0 22 14" fill="none">
                            <path d="M 2 12 C 7 12, 15 2, 20 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                          <span>Curved Wave</span>
                        </button>
                        <button
                          type="button"
                          className={`ice-line-style-btn ${activeCard.lineStyle === 'straight' ? 'active' : ''}`}
                          onClick={() => updateActiveCard({ lineStyle: 'straight' })}
                        >
                          <svg width="22" height="14" viewBox="0 0 22 14" fill="none">
                            <path d="M 2 12 L 20 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                          <span>Straight Line</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Unified Color Theme Palette (Card Border, Pointer Line & Target Dot) */}
                  <div className="ios-sheet-group-card" style={{ padding: '14px', marginTop: '10px' }}>
                    <div className="ios-anchor-header">
                      <span className="ios-sheet-label" style={{ fontSize: '0.85rem' }}>
                        Border, Line & Dot Theme Color
                      </span>
                      <span className="ios-sheet-hint-tag" style={{ textTransform: 'capitalize' }}>
                        {CARD_THEME_COLORS.find(c => c.color.toLowerCase() === (activeThemeColor || '').toLowerCase())?.label || 'Custom'}
                      </span>
                    </div>
                    <p className="ios-sheet-field-desc">
                      Harmonize card border, line, dot, capsule, and screws in unison:
                    </p>

                    <div className="ice-theme-color-palette">
                      {CARD_THEME_COLORS.map(c => {
                        const isSelected = activeThemeColor.toLowerCase() === c.color.toLowerCase();
                        return (
                          <button
                            key={c.id}
                            type="button"
                            className={`ice-theme-color-btn ${isSelected ? 'active' : ''}`}
                            onClick={() => updateActiveCard({ themeColor: c.color })}
                            title={c.label}
                          >
                            <span
                              className="ice-theme-chip"
                              style={{
                                backgroundColor: c.color,
                                boxShadow: isSelected ? `0 0 8px ${c.color}` : 'none'
                              }}
                            />
                            <span className="ice-theme-chip-label">{c.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="ios-sheet-info-card">
                    💡 <strong>Tip:</strong> Drag the target pin on the photo to point at any object (e.g. perfume, shirt, watch). The line, card border, and target dot all match your chosen color theme.
                  </div>
                </div>
              )}

              {/* TAB 2: CARD CONTENT */}
              {activeTab === 'content' && (
                <div className="ios-sheet-content">
                  <div className="ios-sheet-group-card" style={{ gap: '14px', padding: '14px' }}>
                    {/* Title Input Box */}
                    <div className="ios-form-field">
                      <label className="ios-form-label">Title</label>
                      <input
                        type="text"
                        value={activeCard.titleText || ''}
                        onChange={(e) => updateActiveCard({ titleText: e.target.value })}
                        placeholder="e.g. Top, Hoodie, Villa"
                        className="ios-form-input-box"
                      />
                    </div>

                    {/* Price Amount Input Box */}
                    <div className="ios-form-field">
                      <label className="ios-form-label">Price Amount</label>
                      <input
                        type="text"
                        value={(() => {
                          const p = parseCardPrice(activeCard);
                          return p.amount;
                        })()}
                        onChange={(e) => {
                          const rawVal = e.target.value;
                          const p = parseCardPrice(activeCard);
                          // Intelligent comma formatting as user types or pastes
                          const prevClean = (p.amount || '').replace(/,/g, '');
                          const nextClean = rawVal.replace(/,/g, '');
                          let valToFormat = rawVal;
                          if (nextClean === prevClean && rawVal.length < (p.amount || '').length) {
                            valToFormat = nextClean.slice(0, -1);
                          }
                          const formattedAmt = formatNumberWithCommas(valToFormat);
                          const combined = p.isPrefix
                            ? (p.currency ? `${p.currency}${formattedAmt}` : formattedAmt)
                            : (p.currency ? `${formattedAmt} ${p.currency}` : formattedAmt);
                          updateActiveCard({
                            priceAmount: formattedAmt,
                            priceCurrency: p.currency,
                            isPrefixCurrency: p.isPrefix,
                            priceText: combined.trim()
                          });
                        }}
                        placeholder="e.g. 76,000"
                        className="ios-form-input-box"
                      />
                    </div>

                    <div className="ios-sheet-group-divider" style={{ margin: '2px 0' }} />

                    {/* Selectable Currency Row */}
                    <div className="ios-form-field">
                      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                        <label className="ios-form-label">Currency</label>
                        <span className="ios-sheet-hint-tag">
                          {parseCardPrice(activeCard).currency || 'None'}
                        </span>
                      </div>
                      <div className="ios-currency-chips-grid">
                        {[
                          { id: 'MMK', label: 'MMK', prefix: false },
                          { id: 'Ks', label: 'Ks', prefix: false },
                          { id: '$', label: '$ USD', prefix: true },
                          { id: '฿', label: '฿ THB', prefix: true },
                          { id: 'SGD', label: 'SGD', prefix: false },
                          { id: '€', label: '€ EUR', prefix: true },
                          { id: '£', label: '£ GBP', prefix: true },
                          { id: 'none', label: 'None', prefix: false }
                        ].map(curr => {
                          const p = parseCardPrice(activeCard);
                          const isSelected = curr.id === 'none'
                            ? !p.currency
                            : (p.currency || '').toUpperCase() === curr.id.toUpperCase();
                          return (
                            <button
                              key={curr.id}
                              type="button"
                              className={`ios-currency-chip ${isSelected ? 'active' : ''}`}
                              onClick={() => {
                                const newCurr = curr.id === 'none' ? '' : curr.id;
                                const isPrefix = curr.prefix;
                                const formattedAmt = formatNumberWithCommas(p.amount);
                                const combined = isPrefix
                                  ? (newCurr ? `${newCurr}${formattedAmt}` : formattedAmt)
                                  : (newCurr ? `${formattedAmt} ${newCurr}` : formattedAmt);
                                updateActiveCard({
                                  priceAmount: formattedAmt,
                                  priceCurrency: newCurr,
                                  isPrefixCurrency: isPrefix,
                                  priceText: combined.trim()
                                });
                              }}
                            >
                              {curr.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="ios-sheet-group-card">
                    <div
                      className="ios-sheet-group-row ios-sheet-row-toggle"
                      onClick={() => toggleActiveCardKey('hasDivider')}
                      role="button"
                      tabIndex={0}
                    >
                      <span className="ios-sheet-label">Divider Line</span>
                      <div
                        className={`ios-switch ${activeCard.hasDivider ? 'on' : ''}`}
                        role="switch"
                        aria-checked={activeCard.hasDivider}
                      >
                        <div className="ios-switch-thumb" />
                      </div>
                    </div>
                    <div className="ios-sheet-group-divider" />
                    <div
                      className="ios-sheet-group-row ios-sheet-row-toggle"
                      onClick={() => toggleActiveCardKey('hasSizes')}
                      role="button"
                      tabIndex={0}
                    >
                      <span className="ios-sheet-label">Sizes / Badges Row</span>
                      <div
                        className={`ios-switch ${activeCard.hasSizes !== false ? 'on' : ''}`}
                        role="switch"
                        aria-checked={activeCard.hasSizes !== false}
                      >
                        <div className="ios-switch-thumb" />
                      </div>
                    </div>
                  </div>

                  {activeCard.hasSizes && (
                    <div className="ios-available-sizes-section">
                      {/* Section Header with active count & Clear button */}
                      <div className="ios-sizes-header-row">
                        <div className="ios-sizes-header-title-box">
                          <span className="ios-available-sizes-title">ACTIVE SIZES / BADGES ON CARD</span>
                          <span className="ios-sizes-count-badge">{(activeCard.sizesList || []).length} selected</span>
                        </div>
                        {(activeCard.sizesList || []).length > 0 && (
                          <button
                            type="button"
                            className="ios-sizes-clear-btn"
                            onClick={handleClearAllSizes}
                            title="Clear all sizes from card"
                          >
                            Clear
                          </button>
                        )}
                      </div>

                      {/* Active selected badges row */}
                      <div className="ios-selected-sizes-row">
                        {(activeCard.sizesList || []).length === 0 ? (
                          <span className="ios-sizes-empty-hint">No sizes selected yet. Tap any default size below or add custom text.</span>
                        ) : (
                          (activeCard.sizesList || []).map((sz, idx) => (
                            <span key={idx} className="ios-badge-item-pill">
                              <span>{sz}</span>
                              <button
                                type="button"
                                className="ios-badge-item-del"
                                onClick={() => handleRemoveActiveSize(sz)}
                                title={`Remove ${sz}`}
                              >
                                ×
                              </button>
                            </span>
                          ))
                        )}
                      </div>

                      {/* Custom Size / Badge input bar (Dedicated single row) */}
                      <div className="ios-size-custom-add-bar">
                        <input
                          type="text"
                          placeholder="Add custom size or badge (e.g. XL, 32W, Blue)..."
                          value={newSizeInput}
                          onChange={(e) => setNewSizeInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddCustomSize();
                            }
                          }}
                          className="ios-custom-size-input"
                        />
                        <button
                          type="button"
                          className="ios-custom-size-btn"
                          onClick={handleAddCustomSize}
                          title="Add custom size"
                        >
                          <Plus size={15} />
                          <span>Add</span>
                        </button>
                      </div>

                      {/* Default Selectable Sizes & Badges Catalog */}
                      <div className="ios-preset-sizes-catalog">
                        <div className="ios-preset-catalog-label">
                          SELECT DEFAULT SIZES & BADGES
                        </div>

                        {/* Category Tabs: Apparel, Waist/Numbers, Footwear, Badges */}
                        <div className="ios-preset-category-tabs">
                          {SIZE_CATEGORIES.map(cat => (
                            <button
                              key={cat.id}
                              type="button"
                              className={`ios-preset-cat-tab ${activeSizeCategory === cat.id ? 'active' : ''}`}
                              onClick={() => setActiveSizeCategory(cat.id)}
                            >
                              {cat.label}
                            </button>
                          ))}
                        </div>

                        {/* Presets Grid for current category: Tapping toggles without disappearing */}
                        <div className="ios-preset-sizes-grid">
                          {(SIZE_CATEGORIES.find(c => c.id === activeSizeCategory)?.sizes || []).map(sz => {
                            const isSelected = (activeCard.sizesList || []).includes(sz);
                            return (
                              <button
                                key={sz}
                                type="button"
                                className={`ios-preset-size-chip ${isSelected ? 'selected' : ''}`}
                                onClick={() => handleToggleSize(sz)}
                                title={isSelected ? `Remove ${sz} from card` : `Add ${sz} to card`}
                              >
                                <span className="ios-preset-chip-text">{sz}</span>
                                {isSelected && <span className="ios-preset-chip-check">✓</span>}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="ios-sheet-group-card">
                    <div
                      className="ios-sheet-group-row ios-sheet-row-toggle"
                      onClick={() => toggleActiveCardKey('hasTag')}
                      role="button"
                      tabIndex={0}
                    >
                      <span className="ios-sheet-label">Top Highlight Badge</span>
                      <div
                        className={`ios-switch ${activeCard.hasTag ? 'on' : ''}`}
                        role="switch"
                        aria-checked={activeCard.hasTag}
                      >
                        <div className="ios-switch-thumb" />
                      </div>
                    </div>
                    {activeCard.hasTag && (
                      <>
                        <div className="ios-sheet-group-divider" />
                        <div className="ios-form-field" style={{ padding: '0 14px 12px 14px' }}>
                          <label className="ios-form-label">Badge Text</label>
                          <input
                            type="text"
                            value={activeCard.tagText || ''}
                            onChange={(e) => updateActiveCard({ tagText: e.target.value })}
                            placeholder="e.g. FEATURED, SPECIAL, NEW"
                            className="ios-form-input-box"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: DESIGN & STYLE */}
              {activeTab === 'style' && (
                <div className="ios-sheet-content">
                  <div className="ios-sheet-group-card">
                    {/* Card Border Toggle (Remove / Show Glass Border) */}
                    <div
                      className="ios-sheet-group-row ios-sheet-row-toggle"
                      onClick={() => toggleActiveCardKey('hasBorder')}
                      role="button"
                      tabIndex={0}
                    >
                      <div>
                        <span className="ios-sheet-label">Card Border</span>
                        <div className="ios-sheet-field-desc">
                          {activeCard.hasBorder === false ? 'No border (Borderless floating glass)' : 'Glass border with translucent sheen'}
                        </div>
                      </div>
                      <div
                        className={`ios-switch ${activeCard.hasBorder !== false ? 'on' : ''}`}
                        role="switch"
                        aria-checked={activeCard.hasBorder !== false}
                      >
                        <div className="ios-switch-thumb" />
                      </div>
                    </div>

                    <div className="ios-sheet-group-divider" />

                    <div className="ios-sheet-group-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                        <span className="ios-sheet-label">Card Text Color</span>
                        <span className="ios-sheet-hint-tag" style={{ textTransform: 'capitalize' }}>
                          {(() => {
                            const curTxtColor = (activeCard.textColor || (activeCard.textColorMode === 'dark' ? '#0f172a' : '#ffffff')).toLowerCase();
                            const preset = TEXT_COLOR_PRESETS.find(p => p.color.toLowerCase() === curTxtColor);
                            return preset ? preset.label : 'Custom';
                          })()}
                        </span>
                      </div>
                      <div className="ice-theme-color-palette" style={{ width: '100%', marginTop: '2px' }}>
                        {(() => {
                          const curTxtColor = (activeCard.textColor || (activeCard.textColorMode === 'dark' ? '#0f172a' : '#ffffff')).toLowerCase();
                          const isCustomTxt = !TEXT_COLOR_PRESETS.some(p => p.color.toLowerCase() === curTxtColor);
                          return (
                            <>
                              {TEXT_COLOR_PRESETS.map((t) => {
                                const isSelected = curTxtColor === t.color.toLowerCase();
                                return (
                                  <button
                                    key={t.id}
                                    type="button"
                                    className={`ice-theme-color-btn ${isSelected ? 'active' : ''}`}
                                    onClick={() => {
                                      const dark = isColorDark(t.color);
                                      updateActiveCard({
                                        textColor: t.color,
                                        textColorMode: dark ? 'dark' : 'light'
                                      });
                                    }}
                                    title={t.label}
                                  >
                                    <span
                                      className="ice-theme-chip"
                                      style={{
                                        backgroundColor: t.color,
                                        boxShadow: isSelected ? `0 0 8px ${t.color}` : 'none',
                                        border: t.color.toLowerCase() === '#ffffff' ? '1px solid rgba(0,0,0,0.18)' : undefined
                                      }}
                                    />
                                    <span className="ice-theme-chip-label">{t.label}</span>
                                  </button>
                                );
                              })}

                              {/* Custom Text Color Picker */}
                              <label
                                className={`ice-theme-color-btn custom-color-picker-chip ${isCustomTxt ? 'active' : ''}`}
                                title="Choose custom text color"
                              >
                                <span
                                  className="ice-theme-chip custom-color-chip-preview"
                                  style={{
                                    backgroundColor: curTxtColor,
                                    boxShadow: isCustomTxt ? `0 0 8px ${curTxtColor}` : 'none'
                                  }}
                                >
                                  <Pipette size={11} color={curTxtColor === '#ffffff' ? '#111827' : '#ffffff'} />
                                </span>
                                <span className="ice-theme-chip-label">Custom</span>
                                <input
                                  type="color"
                                  value={curTxtColor.startsWith('#') && curTxtColor.length === 7 ? curTxtColor : '#ffffff'}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    const dark = isColorDark(val);
                                    updateActiveCard({
                                      textColor: val,
                                      textColorMode: dark ? 'dark' : 'light'
                                    });
                                  }}
                                  style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
                                />
                              </label>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                    <div className="ios-sheet-group-divider" />
                    <div className="ios-sheet-group-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                        <span className="ios-sheet-label">Border, Line & Dot Color Theme</span>
                        <span className="ios-sheet-hint-tag" style={{ textTransform: 'capitalize' }}>
                          {CARD_THEME_COLORS.find(c => c.color.toLowerCase() === (activeThemeColor || '').toLowerCase())?.label || 'Custom'}
                        </span>
                      </div>
                      <div className="ice-theme-color-palette" style={{ width: '100%', marginTop: '2px' }}>
                        {CARD_THEME_COLORS.map(c => {
                          const isSelected = activeThemeColor.toLowerCase() === c.color.toLowerCase();
                          return (
                            <button
                              key={c.id}
                              type="button"
                              className={`ice-theme-color-btn ${isSelected ? 'active' : ''}`}
                              onClick={() => updateActiveCard({ themeColor: c.color })}
                              title={c.label}
                            >
                              <span
                                className="ice-theme-chip"
                                style={{
                                  backgroundColor: c.color,
                                  boxShadow: isSelected ? `0 0 8px ${c.color}` : 'none'
                                }}
                              />
                              <span className="ice-theme-chip-label">{c.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="ios-sheet-section-title">Glass Styles</div>
                  <div className="ios-sheet-designs-fit-grid">
                    {GLASS_STYLES.map((g) => {
                      const isSelected = activeCard.glassStyle === g.id;
                      const IconComponent = g.icon;
                      return (
                        <button
                          key={g.id}
                          type="button"
                          className={`ios-glass-pill-btn ${isSelected ? 'active' : ''}`}
                          onClick={() => {
                            const isSwitching = activeCard.glassStyle !== g.id;
                            updateActiveCard({
                              glassStyle: g.id,
                              ...(isSwitching ? {
                                glassOpacity: g.defaultOpacity,
                                glassBlur: g.defaultBlur,
                                glassTint: g.defaultTint,
                                textColorMode: g.id === 'blur' ? 'light' : (activeCard.textColorMode || 'dark')
                              } : {})
                            });
                          }}
                        >
                          <IconComponent size={14} className="ios-glass-pill-icon" />
                          <span className="ios-glass-pill-label">{g.name}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Glass Fine-Tuning Container (Adjust Opacity, Blur, and Tint Color depending on selection) */}
                  {(() => {
                    const curDef = GLASS_STYLES.find(g => g.id === (activeCard.glassStyle || 'blur')) || GLASS_STYLES[3];
                    const curOpacity = activeCard.glassOpacity !== undefined ? activeCard.glassOpacity : curDef.defaultOpacity;
                    const curBlur = activeCard.glassBlur !== undefined ? activeCard.glassBlur : curDef.defaultBlur;
                    const curTint = (activeCard.glassTint || curDef.defaultTint).toLowerCase();
                    const activePreset = GLASS_TINT_PRESETS.find(t => t.color.toLowerCase() === curTint);
                    const activeTintName = activePreset ? activePreset.label : 'Custom Tint';
                    const isCustom = !activePreset;

                    return (
                      <div className="ios-glass-adjust-box">
                        {/* Opacity Control */}
                        <div className="ios-glass-adjust-row">
                          <div className="ios-adjust-meta">
                            <span className="ios-adjust-label">Glass Opacity</span>
                            <span className="ios-adjust-val-badge">{curOpacity}%</span>
                          </div>
                          <div className="ios-scale-slider-row">
                            <span className="ios-scale-slider-label">5%</span>
                            <input
                              type="range"
                              min="5"
                              max="100"
                              step="1"
                              value={curOpacity}
                              onChange={(e) => updateActiveCard({ glassOpacity: parseInt(e.target.value, 10) })}
                              className="ios-scale-slider"
                            />
                            <span className="ios-scale-slider-label" style={{ textAlign: 'right' }}>100%</span>
                          </div>
                        </div>

                        <div className="ios-sheet-group-divider" />

                        {/* Backdrop Blur Control */}
                        <div className="ios-glass-adjust-row">
                          <div className="ios-adjust-meta">
                            <span className="ios-adjust-label">Backdrop Blur</span>
                            <span className="ios-adjust-val-badge">{curBlur}px</span>
                          </div>
                          <div className="ios-scale-slider-row">
                            <span className="ios-scale-slider-label">0px</span>
                            <input
                              type="range"
                              min="0"
                              max="30"
                              step="1"
                              value={curBlur}
                              onChange={(e) => updateActiveCard({ glassBlur: parseInt(e.target.value, 10) })}
                              className="ios-scale-slider"
                            />
                            <span className="ios-scale-slider-label" style={{ textAlign: 'right' }}>30px</span>
                          </div>
                        </div>

                        <div className="ios-sheet-group-divider" />

                        {/* Glass Tint Color Control */}
                        <div className="ios-glass-adjust-row">
                          <div className="ios-adjust-meta">
                            <span className="ios-adjust-label">Glass Tint Color</span>
                            <span className="ios-sheet-hint-tag" style={{ textTransform: 'capitalize' }}>
                              {activeTintName}
                            </span>
                          </div>
                          <div className="ice-theme-color-palette" style={{ marginTop: '4px' }}>
                            {/* Preset Tint Colors */}
                            {GLASS_TINT_PRESETS.map((t) => {
                              const isSelected = curTint === t.color.toLowerCase();
                              return (
                                <button
                                  key={t.id}
                                  type="button"
                                  className={`ice-theme-color-btn ${isSelected ? 'active' : ''}`}
                                  onClick={() => updateActiveCard({ glassTint: t.color })}
                                  title={t.label}
                                >
                                  <span
                                    className="ice-theme-chip"
                                    style={{
                                      backgroundColor: t.color,
                                      boxShadow: isSelected ? `0 0 8px ${t.color}` : 'none',
                                      border: t.color.toLowerCase() === '#ffffff' ? '1px solid rgba(0,0,0,0.18)' : undefined
                                    }}
                                  />
                                  <span className="ice-theme-chip-label">{t.label}</span>
                                </button>
                              );
                            })}

                            {/* Custom Color Picker */}
                            <label
                              className={`ice-theme-color-btn custom-color-picker-chip ${isCustom ? 'active' : ''}`}
                              title="Pick custom tint color"
                            >
                              <span
                                className="ice-theme-chip custom-color-chip-preview"
                                style={{
                                  backgroundColor: curTint,
                                  boxShadow: isCustom ? `0 0 8px ${curTint}` : 'none'
                                }}
                              >
                                <Pipette size={11} color={curTint === '#ffffff' ? '#111827' : '#ffffff'} />
                              </span>
                              <span className="ice-theme-chip-label">Custom</span>
                              <input
                                type="color"
                                value={curTint.startsWith('#') && curTint.length === 7 ? curTint : '#ffffff'}
                                onChange={(e) => updateActiveCard({ glassTint: e.target.value })}
                                style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="ios-sheet-section-title">Typography Font</div>
                  <div className="ios-sheet-fonts-grid">
                    {FONTS.map((f) => {
                      const isSelected = activeCard.fontFamily === f.value;
                      return (
                        <div
                          key={f.value}
                          className={`ios-sheet-font-card ${isSelected ? 'active' : ''}`}
                          onClick={() => updateActiveCard({ fontFamily: f.value })}
                          style={{ fontFamily: f.value }}
                        >
                          <span className="ios-sheet-font-preview">Abc</span>
                          <span className="ios-sheet-font-name">{f.label.split(' ')[0]}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 4: TEMPLATES & PRESETS */}
              {activeTab === 'templates' && (
                <div className="ios-sheet-content">
                  {/* Save Current Card */}
                  <div className="ios-sheet-save-bar">
                    <input
                      type="text"
                      placeholder="Name this template..."
                      value={templateNameInput}
                      onChange={(e) => setTemplateNameInput(e.target.value)}
                      className="ios-sheet-input-box"
                    />
                    <button
                      type="button"
                      className="ios-sheet-save-btn"
                      onClick={handleSaveTemplate}
                    >
                      <Plus size={14} />
                      <span>Save Preset</span>
                    </button>
                  </div>

                  {saveSuccessMsg && (
                    <div className="ios-sheet-success-msg">
                      ✓ {saveSuccessMsg}
                    </div>
                  )}

                  {/* Custom Presets */}
                  <div className="ios-sheet-section-title">My Saved Presets</div>
                  {customTemplates.length > 0 ? (
                    <div className="ios-sheet-templates-grid">
                      {customTemplates.map((tpl) => (
                        <div
                          key={tpl.id}
                          className="ios-sheet-template-item custom"
                          onClick={() => applyTemplate(tpl)}
                        >
                          <div className="ios-sheet-template-row">
                            <span className="ios-sheet-template-name">{tpl.name}</span>
                            <button
                              type="button"
                              className="ios-sheet-del-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTemplate(tpl.id);
                              }}
                              title="Delete preset"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                          <div className="ios-sheet-template-desc">{tpl.titleText} • {tpl.priceText}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '1.5rem 1rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                      No saved presets yet. Enter a name above and tap "Save Preset" to save your custom design.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Actions inside Sheet: Save Template & Done */}
            <div className="ios-sheet-actions">
              <button
                type="button"
                className={`ios-sheet-btn-secondary ${isSavedFeedback ? 'saved' : ''}`}
                onClick={handleQuickSaveDesign}
                title="Save current adjusted design as a reusable template"
              >
                {isSavedFeedback ? (
                  <>
                    <Check size={16} />
                    <span>Saved ✓</span>
                  </>
                ) : (
                  <>
                    <Bookmark size={15} />
                    <span>Save Template</span>
                  </>
                )}
              </button>

              <button
                type="button"
                className="ios-sheet-btn-primary"
                onClick={() => setIsStudioPopupOpen(false)}
              >
                Done
              </button>
            </div>
          </div>
        </>,
        document.body
      )}

      {/* ============================================================ */}
      {/* BOTTOM ACTION BAR (Single Row: Photo #, Add Card, Preview)   */}
      {/* ============================================================ */}
      <div className="ice-actions-single-row">
        <button
          type="button"
          className="insta-thumb-indicator"
          onClick={() => setIsPhotoPickerOpen(true)}
          title="Click to choose from uploaded photos"
        >
          <img src={activeImageUrl || imageUrl} alt="thumb" className="insta-thumb-img" />
          <span className="insta-thumb-label">Photo #{imageIndex + 1}</span>
        </button>

        <button
          type="button"
          className="ice-action-btn-add-inline"
          onClick={handleAddCard}
          title="Add product card to this photo"
        >
          <SquarePlus size={16} />
          <span>Add Card</span>
        </button>

        <button
          type="button"
          className="btn btn-glass insta-preview-btn"
          onClick={handleOpenFinalPreview}
          disabled={isGeneratingPreview}
          title="Preview final image as downloaded"
        >
          <Eye size={16} />
          <span>{isGeneratingPreview ? 'Rendering...' : 'Preview'}</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* UPLOADED PHOTOS SWITCHER POPUP MODAL                         */}
      {/* ============================================================ */}
      {isPhotoPickerOpen && createPortal(
        <>
          <div
            className="ios-sheet-backdrop"
            onClick={() => setIsPhotoPickerOpen(false)}
          />
          <div
            className="ios-photo-picker-sheet animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Grabber Handle */}
            <div className="ios-sheet-handle" />

            {/* Header */}
            <div className="ios-photo-picker-header">
              <div className="ios-photo-picker-title-box">
                <span className="ios-photo-picker-title">Uploaded Photos</span>
                <span className="ios-photo-picker-count">
                  {(allImages && allImages.length > 0 ? allImages.length : 1)} photos
                </span>
              </div>
              <button
                type="button"
                className="ios-photo-picker-close-btn"
                onClick={() => setIsPhotoPickerOpen(false)}
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Grid of uploaded images */}
            <div className="ios-photo-picker-grid">
              {(allImages && allImages.length > 0 ? allImages : [{
                index: imageIndex,
                url: activeImageUrl || imageUrl,
                name: `Photo #${imageIndex + 1}`,
                cardCount: cards.length
              }]).map((photo) => {
                const isCurrent = photo.index === imageIndex;
                return (
                  <button
                    key={photo.index}
                    type="button"
                    className={`ios-photo-card ${isCurrent ? 'active' : ''}`}
                    onClick={() => handleSelectPhoto(photo.index)}
                    title={`Switch to Photo #${photo.index + 1}`}
                  >
                    <div className="ios-photo-card-thumb-wrap">
                      <img src={photo.url} alt={photo.name} className="ios-photo-card-img" />
                      {isCurrent && (
                        <div className="ios-photo-active-badge">
                          <Check size={13} strokeWidth={3} />
                        </div>
                      )}
                      {photo.cardCount > 0 && !isCurrent && (
                        <div className="ios-photo-card-cards-tag">
                          {photo.cardCount} {photo.cardCount === 1 ? 'card' : 'cards'}
                        </div>
                      )}
                    </div>
                    <div className="ios-photo-card-info">
                      <span className="ios-photo-card-index">Photo #{photo.index + 1}</span>
                      {isCurrent && <span className="ios-photo-card-current-tag">Editing</span>}
                    </div>
                  </button>
                );
              })}

              {/* Upload More Photos Tile */}
              {onUploadMoreImages && (
                <label className="ios-photo-card upload-more-card" title="Upload more photos">
                  <div className="ios-photo-upload-inner">
                    <Plus size={22} />
                    <span>Add Photo</span>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      onUploadMoreImages(e);
                      setIsPhotoPickerOpen(false);
                    }}
                    style={{ display: 'none' }}
                  />
                </label>
              )}
            </div>
          </div>
        </>,
        document.body
      )}

      {/* ============================================================ */}
      {/* HIGH-RES FINAL DOWNLOAD PREVIEW MODAL / LIGHTBOX             */}
      {/* ============================================================ */}
      {isPreviewModalOpen && previewDataUrl && createPortal(
        <div
          className="ice-final-preview-modal animate-fade-in"
          onClick={() => setIsPreviewModalOpen(false)}
        >
          <div
            className="ice-final-preview-dialog animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="ice-final-preview-header">
              <div className="ice-final-preview-title-box">
                <span className="ice-final-preview-title">Download Preview</span>
                <span className="ice-final-preview-subtitle">Exact result as exported</span>
              </div>
              <button
                type="button"
                className="ice-final-preview-close"
                onClick={() => setIsPreviewModalOpen(false)}
                title="Close Preview"
              >
                <X size={18} />
              </button>
            </div>

            {/* Preview Image Body */}
            <div className="ice-final-preview-body">
              <img
                src={previewDataUrl}
                alt="Final Download Preview"
                className="ice-final-preview-image"
              />
            </div>

            {/* Footer with Download and Keep Editing */}
            <div className="ice-final-preview-footer">
              <button
                type="button"
                className="ice-final-preview-btn-edit"
                onClick={() => setIsPreviewModalOpen(false)}
              >
                <ArrowLeft size={16} />
                <span>Keep Editing</span>
              </button>

              <div className="ice-final-preview-cta-group">
                <button
                  type="button"
                  className="ice-final-preview-btn-download"
                  onClick={handleDownloadPreview}
                  title="Download image to your device"
                >
                  <Download size={16} />
                  <span>Download Image</span>
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
