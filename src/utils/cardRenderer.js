// Utility functions and canvas drawing engine for Glass Cards

export const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

export const getCardThemeColor = (card) => {
  if (card?.themeColor) return card.themeColor;
  return card?.textColorMode === 'dark' ? '#0f172a' : '#ffffff';
};

// Compute exact attachment point on card box (corners, edges or auto ray)
export function getAnchorPoint(card, target, anchorMode = 'auto') {
  const cx = card.x;
  const cy = card.y;
  const halfW = (card.width || 28) / 2;
  const halfH = (card.height || 15) / 2;

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
        const attachY = clamp(cy + dy * 0.35, cy - halfH * 0.58, cy + halfH * 0.58);
        return { x: cx - halfW, y: attachY, side: 'left', arrow: '▶' };
      } else {
        const attachY = clamp(cy + dy * 0.35, cy - halfH * 0.58, cy + halfH * 0.58);
        return { x: cx + halfW, y: attachY, side: 'right', arrow: '◀' };
      }
    }
  }
}

// Compute path between anchor capsule and target pin (curved or straight line)
export function getConnectorCurve(anchor, target, side = 'left', style = 'curved') {
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

  if (side === 'left') {
    const bend = Math.min(Math.abs(dx) * 0.65, 26);
    return {
      d: `M ${ax} ${ay} C ${ax - bend} ${ay}, ${tx + bend * 0.4} ${ty}, ${tx} ${ty}`,
      c1: { x: ax - bend, y: ay },
      c2: { x: tx + bend * 0.4, y: ty }
    };
  }

  if (side === 'right') {
    const bend = Math.min(Math.abs(dx) * 0.65, 26);
    return {
      d: `M ${ax} ${ay} C ${ax + bend} ${ay}, ${tx - bend * 0.4} ${ty}, ${tx} ${ty}`,
      c1: { x: ax + bend, y: ay },
      c2: { x: tx - bend * 0.4, y: ty }
    };
  }

  if (side === 'top') {
    const bend = Math.min(Math.abs(dy) * 0.65, 26);
    return {
      d: `M ${ax} ${ay} C ${ax} ${ay - bend}, ${tx} ${ty + bend * 0.4}, ${tx} ${ty}`,
      c1: { x: ax, y: ay - bend },
      c2: { x: tx, y: ty + bend * 0.4 }
    };
  }

  if (side === 'bottom') {
    const bend = Math.min(Math.abs(dy) * 0.65, 26);
    return {
      d: `M ${ax} ${ay} C ${ax} ${ay + bend}, ${tx} ${ty - bend * 0.4}, ${tx} ${ty}`,
      c1: { x: ax, y: ay + bend },
      c2: { x: tx, y: ty - bend * 0.4 }
    };
  }

  return {
    d: `M ${ax} ${ay} Q ${(ax + tx) / 2} ${(ay + ty) / 2 - 10} ${tx} ${ty}`,
    c1: { x: (ax + tx) / 2, y: (ay + ty) / 2 - 10 },
    c2: { x: (ax + tx) / 2, y: (ay + ty) / 2 - 10 }
  };
}

// Helper: Auto-format numbers with thousands commas (e.g. 85000 -> 85,000)
export function formatNumberWithCommas(val) {
  if (val === undefined || val === null) return '';
  const str = String(val).trim();
  if (!str) return '';

  const clean = str.replace(/,/g, '');
  const match = clean.match(/^(\d+)(\.\d*)?$/);
  if (match) {
    const intPart = match[1].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const decPart = match[2] !== undefined ? match[2] : '';
    return `${intPart}${decPart}`;
  }

  const suffixMatch = clean.match(/^(\d+)(\.\d*)?\s*(.+)$/);
  if (suffixMatch) {
    const intPart = suffixMatch[1].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const decPart = suffixMatch[2] !== undefined ? suffixMatch[2] : '';
    const suffix = suffixMatch[3];
    return `${intPart}${decPart} ${suffix}`;
  }

  return str;
}

// Helper: Parse Price Amount & Currency with reduced bold size for currency unit
export function parseCardPrice(card) {
  if (!card) return { amount: '', currency: '', isPrefix: false };
  if (card.priceAmount !== undefined && card.priceCurrency !== undefined) {
    return {
      amount: formatNumberWithCommas(card.priceAmount),
      currency: String(card.priceCurrency),
      isPrefix: Boolean(card.isPrefixCurrency)
    };
  }

  const str = (card.priceText || '').trim();
  if (!str) return { amount: '', currency: '', isPrefix: false };

  const prefixMatch = str.match(/^([$€£฿¥₹])\s*([\d,.]+.*)$/);
  if (prefixMatch) {
    return {
      amount: formatNumberWithCommas(prefixMatch[2].trim()),
      currency: prefixMatch[1],
      isPrefix: true
    };
  }

  const postfixMatch = str.match(/^([\d,.]+)\s*([A-Za-z/ ]+)$/);
  if (postfixMatch) {
    return {
      amount: formatNumberWithCommas(postfixMatch[1].trim()),
      currency: postfixMatch[2].trim(),
      isPrefix: false
    };
  }

  return {
    amount: formatNumberWithCommas(str),
    currency: '',
    isPrefix: false
  };
}

// Draw all cards onto any 2D canvas context
export function drawCardsOnCanvas(ctx, baseImg, natW, natH, cards, screenW = 400) {
  if (!cards || !Array.isArray(cards) || cards.length === 0) return;

  const canvasScale = natW / Math.max(100, screenW);

  const traceRoundRect = (x, y, w, h, radius) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  };

  cards.forEach((card) => {
    if (!card.hasCard) return;

    // 1. Measure text content to snugly auto-fit card width and height (no extra empty width)
    const cardUserScale = card.scale !== undefined ? card.scale : 0.6;
    const cardScale = canvasScale * cardUserScale;
    const themeColor = getCardThemeColor(card);
    const isDarkText = card.textColorMode === 'dark';
    const padX = 16 * cardScale;
    const padY = 11 * cardScale;

    const titleFontSz = 14 * cardScale;
    const priceFontSz = 22 * cardScale;
    const sizeFontSz = 10.5 * cardScale;
    const tagFontSz = 9.5 * cardScale;

    let maxContentW = 0;

    // Measure Tag
    if (card.hasTag && card.tagText) {
      ctx.font = `800 ${tagFontSz}px -apple-system, sans-serif`;
      const m = ctx.measureText(card.tagText);
      const tagW = m.width + (tagFontSz * 1.4);
      if (tagW > maxContentW) maxContentW = tagW;
    }

    // Measure Title
    if (card.titleText) {
      ctx.font = `400 ${titleFontSz}px "${card.fontFamily || 'Montserrat'}", -apple-system, sans-serif`;
      const m = ctx.measureText(card.titleText);
      if (m.width > maxContentW) maxContentW = m.width;
    }

    // Measure Price (Bold number amount with reduced bold size for currency like MMK)
    const { amount: pAmt, currency: pCurr, isPrefix: pPrefix } = parseCardPrice(card);
    const currFontSz = priceFontSz * 0.68;
    if (pAmt || pCurr) {
      let priceRowW = 0;
      if (pAmt) {
        ctx.font = `800 ${priceFontSz}px "${card.fontFamily || 'Montserrat'}", -apple-system, sans-serif`;
        priceRowW += ctx.measureText(pAmt).width;
      }
      if (pCurr) {
        ctx.font = `500 ${currFontSz}px "${card.fontFamily || 'Montserrat'}", -apple-system, sans-serif`;
        priceRowW += ctx.measureText(pCurr).width + (pAmt ? 4 * cardScale : 0);
      }
      if (priceRowW > maxContentW) maxContentW = priceRowW;
    }

    // Measure Sizes row
    if (card.hasSizes && card.sizesList && card.sizesList.length > 0) {
      ctx.font = `700 ${sizeFontSz}px "${card.fontFamily || 'Montserrat'}", -apple-system, sans-serif`;
      let sizesRowW = 0;
      const pillH = sizeFontSz * 1.9;
      card.sizesList.forEach((sz, idx) => {
        const m = ctx.measureText(sz);
        const pillW = Math.max(pillH * 1.2, m.width + (10 * cardScale));
        sizesRowW += pillW + (idx > 0 ? 5 * cardScale : 0);
      });
      if (sizesRowW > maxContentW) maxContentW = sizesRowW;
    }

    // Snug fitted width & height
    const cw = Math.max(65 * cardScale, maxContentW + (padX * 2));

    const tagH = (card.hasTag && card.tagText) ? (tagFontSz * 1.8 + 4 * cardScale) : 0;
    const titleH = card.titleText ? (titleFontSz * 1.25) : 0;
    const priceH = card.priceText ? (priceFontSz * 1.25) : 0;
    const divH = card.hasDivider ? (10 * cardScale) : 0;
    const sizesH = (card.hasSizes && card.sizesList && card.sizesList.length > 0) ? (sizeFontSz * 1.9) : 0;
    const totalH = tagH + titleH + priceH + divH + sizesH;
    const ch = Math.max(38 * cardScale, totalH + (padY * 2));

    const cx = (card.x / 100) * natW - (cw / 2);
    const cy = (card.y / 100) * natH - (ch / 2);
    const r = 14 * cardScale;

    const fittedCard = {
      ...card,
      width: (cw / natW) * 100,
      height: (ch / natH) * 100
    };

    // 2. Draw Target Pointer Line & Glowing Pin
    if (card.hasTargetLine) {
      const anchor = getAnchorPoint(fittedCard, card.targetPos, card.targetAnchor);
      const isStraight = card.lineStyle === 'straight';
      const curve = getConnectorCurve(anchor, card.targetPos, anchor.side, card.lineStyle || 'curved');
      const axPx = (anchor.x / 100) * natW;
      const ayPx = (anchor.y / 100) * natH;
      const txPx = (card.targetPos.x / 100) * natW;
      const tyPx = (card.targetPos.y / 100) * natH;
      const c1xPx = (curve.c1.x / 100) * natW;
      const c1yPx = (curve.c1.y / 100) * natH;
      const c2xPx = (curve.c2.x / 100) * natW;
      const c2yPx = (curve.c2.y / 100) * natH;

      // Shadow Line
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(axPx, ayPx);
      if (isStraight) {
        ctx.lineTo(txPx, tyPx);
      } else {
        ctx.bezierCurveTo(c1xPx, c1yPx, c2xPx, c2yPx, txPx, tyPx);
      }
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.lineWidth = Math.max(2, 2.5 * canvasScale);
      ctx.lineCap = 'round';
      ctx.stroke();

      // Crisp Theme Color Line
      ctx.beginPath();
      ctx.moveTo(axPx, ayPx);
      if (isStraight) {
        ctx.lineTo(txPx, tyPx);
      } else {
        ctx.bezierCurveTo(c1xPx, c1yPx, c2xPx, c2yPx, txPx, tyPx);
      }
      ctx.strokeStyle = themeColor;
      ctx.lineWidth = Math.max(1.2, 1.5 * canvasScale);
      ctx.lineCap = 'round';
      ctx.stroke();

      // Target Pin (Small, clean circle in Theme Color - matches card border)
      const pinR = Math.max(1.8, 2.4 * canvasScale);
      ctx.beginPath();
      ctx.arc(txPx, tyPx, pinR, 0, Math.PI * 2);
      ctx.fillStyle = themeColor;
      ctx.fill();

      ctx.restore();
    }

    // 3. Drop shadow
    ctx.save();
    traceRoundRect(cx, cy, cw, ch, r);
    ctx.shadowColor = 'rgba(0, 0, 0, 0.28)';
    ctx.shadowBlur = Math.max(12, 18 * canvasScale);
    ctx.shadowOffsetY = Math.max(6, 8 * canvasScale);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.fill();
    ctx.restore();

    // 4. Glass Card Base with Real Frosted Backdrop Blur
    ctx.save();
    traceRoundRect(cx, cy, cw, ch, r);
    ctx.clip();

    if (baseImg && ctx.filter !== undefined) {
      ctx.filter = card.glassStyle === 'blur' ? `blur(${Math.round(14 * canvasScale)}px)` : `blur(${Math.round(8 * canvasScale)}px)`;
      ctx.drawImage(baseImg, 0, 0, natW, natH);
      ctx.filter = 'none';
    }

    if (card.glassStyle === 'frosted') {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.24)';
    } else if (card.glassStyle === 'liquid') {
      const grad = ctx.createLinearGradient(cx, cy, cx + cw, cy + ch);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.32)');
      grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.14)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0.26)');
      ctx.fillStyle = grad;
    } else if (card.glassStyle === 'translucent') {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
    } else if (card.glassStyle === 'blur') {
      const grad = ctx.createLinearGradient(cx, cy, cx, cy + ch);
      grad.addColorStop(0, 'rgba(32, 36, 44, 0.65)');
      grad.addColorStop(1, 'rgba(16, 20, 26, 0.75)');
      ctx.fillStyle = grad;
    } else if (card.glassStyle === 'privacy') {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    }
    ctx.fillRect(cx, cy, cw, ch);
    ctx.restore();

    // 5. Border stroke (Theme Color)
    ctx.save();
    traceRoundRect(cx, cy, cw, ch, r);
    ctx.strokeStyle = themeColor;
    ctx.lineWidth = Math.max(1.2, 1.4 * canvasScale);
    ctx.stroke();
    ctx.restore();

    // 5.2 Draw Anchor on Card Border (Capsule Badge or Small Circle in Theme Color)
    if (card.hasTargetLine) {
      ctx.save();
      const cardAnchor = getAnchorPoint(fittedCard, card.targetPos, card.targetAnchor);
      const axPx = (cardAnchor.x / 100) * natW;
      const ayPx = (cardAnchor.y / 100) * natH;

      if (card.anchorStyle === 'circle') {
        const dotR = Math.max(1.8, 2.4 * canvasScale);
        ctx.beginPath();
        ctx.arc(axPx, ayPx, dotR, 0, Math.PI * 2);
        ctx.fillStyle = themeColor;
        ctx.fill();
      } else {
        const isHoriz = cardAnchor.side === 'top' || cardAnchor.side === 'bottom';
        const capW = (isHoriz ? 24 : 12) * cardScale;
        const capH = (isHoriz ? 12 : 24) * cardScale;
        const capR = Math.min(capW, capH) / 2;

        traceRoundRect(axPx - capW / 2, ayPx - capH / 2, capW, capH, capR);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
        ctx.shadowBlur = Math.max(2, 3 * canvasScale);
        ctx.fill();
        ctx.strokeStyle = themeColor;
        ctx.lineWidth = Math.max(1.2, 1.4 * canvasScale);
        ctx.stroke();

        ctx.fillStyle = themeColor;
        ctx.beginPath();
        const arrW = 5 * cardScale;
        const arrH = 6 * cardScale;
        if (cardAnchor.side === 'left' || cardAnchor.arrow === '▶') {
          ctx.moveTo(axPx - arrW / 2, ayPx - arrH / 2);
          ctx.lineTo(axPx + arrW / 2, ayPx);
          ctx.lineTo(axPx - arrW / 2, ayPx + arrH / 2);
        } else if (cardAnchor.side === 'right' || cardAnchor.arrow === '◀') {
          ctx.moveTo(axPx + arrW / 2, ayPx - arrH / 2);
          ctx.lineTo(axPx - arrW / 2, ayPx);
          ctx.lineTo(axPx + arrW / 2, ayPx + arrH / 2);
        } else if (cardAnchor.side === 'top' || cardAnchor.arrow === '▼') {
          ctx.moveTo(axPx - arrH / 2, ayPx - arrW / 2);
          ctx.lineTo(axPx, ayPx + arrW / 2);
          ctx.lineTo(axPx + arrH / 2, ayPx - arrW / 2);
        } else {
          ctx.moveTo(axPx - arrH / 2, ayPx + arrW / 2);
          ctx.lineTo(axPx, ayPx - arrW / 2);
          ctx.lineTo(axPx + arrH / 2, ayPx + arrW / 2);
        }
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    // 6. Text Elements (Centered vertically matching DOM layout)
    ctx.save();
    const textX = cx + padX;
    let curY = cy + Math.max(padY, (ch - totalH) / 2);

    // Optional Tag Pill
    if (card.hasTag && card.tagText) {
      ctx.font = `800 ${tagFontSz}px -apple-system, sans-serif`;
      const tm = ctx.measureText(card.tagText);
      const tw = tm.width + (tagFontSz * 1.4);
      const th = tagFontSz * 1.8;
      traceRoundRect(textX, curY, tw, th, 4 * cardScale);
      ctx.fillStyle = themeColor;
      ctx.fill();
      ctx.fillStyle = isDarkText ? '#ffffff' : '#0f172a';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(card.tagText, textX + (tw / 2), curY + (th / 2));
      curY += th + (4 * cardScale);
    }

    // Title
    if (card.titleText) {
      ctx.font = `400 ${titleFontSz}px "${card.fontFamily || 'Montserrat'}", -apple-system, sans-serif`;
      ctx.fillStyle = isDarkText ? 'rgba(15, 23, 42, 0.72)' : 'rgba(255, 255, 255, 0.78)';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(card.titleText, textX, curY);
      curY += titleFontSz * 1.25;
    }

    // Price Amount & Currency (Reduced bold size for currency like MMK)
    if (pAmt || pCurr) {
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      let currX = textX;

      if (pPrefix && pCurr) {
        ctx.font = `500 ${currFontSz}px "${card.fontFamily || 'Montserrat'}", -apple-system, sans-serif`;
        ctx.fillStyle = isDarkText ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.88)';
        ctx.fillText(pCurr, currX, curY + (priceFontSz - currFontSz) * 0.75);
        currX += ctx.measureText(pCurr).width + (3 * cardScale);
      }

      if (pAmt) {
        ctx.font = `800 ${priceFontSz}px "${card.fontFamily || 'Montserrat'}", -apple-system, sans-serif`;
        ctx.fillStyle = isDarkText ? '#0f172a' : '#ffffff';
        ctx.fillText(pAmt, currX, curY);
        currX += ctx.measureText(pAmt).width;
      }

      if (!pPrefix && pCurr) {
        currX += (4 * cardScale);
        ctx.font = `500 ${currFontSz}px "${card.fontFamily || 'Montserrat'}", -apple-system, sans-serif`;
        ctx.fillStyle = isDarkText ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.88)';
        ctx.fillText(pCurr, currX, curY + (priceFontSz - currFontSz) * 0.75);
      }

      curY += priceFontSz * 1.25;
    }

    // Divider Line
    if (card.hasDivider) {
      curY += 2 * cardScale;
      ctx.beginPath();
      ctx.moveTo(textX, curY);
      ctx.lineTo(cx + cw - padX, curY);
      ctx.strokeStyle = isDarkText ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = Math.max(1, 1.2 * cardScale);
      ctx.stroke();
      curY += 8 * cardScale;
    }

    // Sizes Pills
    if (card.hasSizes && card.sizesList && card.sizesList.length > 0) {
      ctx.font = `700 ${sizeFontSz}px "${card.fontFamily || 'Montserrat'}", -apple-system, sans-serif`;
      let pillX = textX;
      const pillH = sizeFontSz * 1.9;
      const pillRadius = 6 * cardScale;

      card.sizesList.forEach(sz => {
        const szMetrics = ctx.measureText(sz);
        const pillW = Math.max(pillH * 1.2, szMetrics.width + (10 * cardScale));

        ctx.save();
        traceRoundRect(pillX, curY, pillW, pillH, pillRadius);
        ctx.strokeStyle = isDarkText ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = Math.max(1, 1.2 * cardScale);
        ctx.stroke();

        ctx.fillStyle = isDarkText ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.12)';
        ctx.fill();

        ctx.fillStyle = isDarkText ? '#0f172a' : '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(sz, pillX + (pillW / 2), curY + (pillH / 2));
        ctx.restore();

        pillX += pillW + (6 * cardScale);
      });
    }

    ctx.restore();
  });
}

// Complete helper to bake cards onto an image source URL
export async function bakeCardsOntoImage(imageSrc, cards, screenW = 400) {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = imageSrc;

  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
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

  const canvas = document.createElement('canvas');
  canvas.width = natW;
  canvas.height = natH;
  const ctx = canvas.getContext('2d');

  ctx.drawImage(img, 0, 0, natW, natH);
  drawCardsOnCanvas(ctx, img, natW, natH, cards, screenW);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Canvas toBlob failed'));
        return;
      }
      const dataUrl = canvas.toDataURL('image/png');
      resolve({ blob, dataUrl });
    }, 'image/png');
  });
}
