import React, { useState } from 'react';
import { ArrowLeft, Copy, Check, Clipboard, Trash2, Sparkles } from 'lucide-react';

// Unicode Mathematical Bold Character Maps
// Allows bold text to be pasted anywhere (Facebook, Instagram, Telegram, Messenger, TikTok, etc.)
function convertToUnicodeBold(text, style = 'sans') {
  if (!text) return '';

  return Array.from(text).map(char => {
    const code = char.codePointAt(0);

    if (style === 'sans') {
      // Mathematical Sans-Serif Bold
      // A-Z: 0x1D5D4 - 0x1D5ED
      if (code >= 65 && code <= 90) {
        return String.fromCodePoint(0x1D5D4 + (code - 65));
      }
      // a-z: 0x1D5EE - 0x1D607
      if (code >= 97 && code <= 122) {
        return String.fromCodePoint(0x1D5EE + (code - 97));
      }
      // 0-9: 0x1D7EC - 0x1D7F5
      if (code >= 48 && code <= 57) {
        return String.fromCodePoint(0x1D7EC + (code - 48));
      }
    } else if (style === 'serif') {
      // Mathematical Bold Serif
      // A-Z: 0x1D400 - 0x1D419
      if (code >= 65 && code <= 90) {
        return String.fromCodePoint(0x1D400 + (code - 65));
      }
      // a-z: 0x1D41A - 0x1D433
      if (code >= 97 && code <= 122) {
        return String.fromCodePoint(0x1D41A + (code - 97));
      }
      // 0-9: 0x1D7CE - 0x1D7D7
      if (code >= 48 && code <= 57) {
        return String.fromCodePoint(0x1D7CE + (code - 48));
      }
    } else if (style === 'italic') {
      // Mathematical Sans-Serif Bold Italic
      // A-Z: 0x1D63C - 0x1D655
      if (code >= 65 && code <= 90) {
        return String.fromCodePoint(0x1D63C + (code - 65));
      }
      // a-z: 0x1D656 - 0x1D66F
      if (code >= 97 && code <= 122) {
        return String.fromCodePoint(0x1D656 + (code - 97));
      }
      // Digits fallback to sans bold
      if (code >= 48 && code <= 57) {
        return String.fromCodePoint(0x1D7EC + (code - 48));
      }
    }

    return char;
  }).join('');
}

const TextEditor = ({ onBack }) => {
  const [inputText, setInputText] = useState('');
  const [boldStyle, setBoldStyle] = useState('sans'); // 'sans' | 'serif' | 'italic'
  const [copied, setCopied] = useState(false);

  const boldText = convertToUnicodeBold(inputText, boldStyle);

  const handleCopy = async () => {
    if (!boldText) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(boldText);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = boldText;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handlePaste = async () => {
    try {
      if (navigator?.clipboard?.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setInputText(prev => (prev ? prev + ' ' + text : text));
        }
      }
    } catch (err) {
      console.error('Failed to read clipboard: ', err);
    }
  };

  const handleClear = () => {
    setInputText('');
  };

  return (
    <div className="text-editor-page animate-fade-in">
      {/* Editor Header */}
      <div className="text-editor-header">
        <button
          className="btn btn-glass btn-icon-only"
          onClick={onBack}
          title="Back to Calculator"
          aria-label="Back to Calculator"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="text-editor-title-wrap">
          <h2 className="text-editor-title">Bold Text Editor</h2>
          <span className="text-editor-badge">
            <Sparkles size={12} /> Paste Anywhere
          </span>
        </div>
      </div>

      {/* Editor Main Content */}
      <div className="text-editor-body">
        {/* Pasted Box Section */}
        <div className="text-editor-section">
          <div className="text-editor-label-row">
            <label htmlFor="pasted-box" className="text-editor-label">
              Pasted Box
            </label>
            <div className="text-editor-actions">
              <button
                type="button"
                className="btn-action-small"
                onClick={handlePaste}
                title="Paste from clipboard"
              >
                <Clipboard size={13} /> Paste
              </button>
              {inputText && (
                <button
                  type="button"
                  className="btn-action-small btn-action-clear"
                  onClick={handleClear}
                  title="Clear text"
                >
                  <Trash2 size={13} /> Clear
                </button>
              )}
            </div>
          </div>

          <textarea
            id="pasted-box"
            className="text-editor-textarea"
            placeholder="Type or paste your text here to convert into bold design..."
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            rows={4}
          />
          <div className="text-editor-meta">
            <span>{inputText.length} characters</span>
            <span>{inputText.trim() ? inputText.trim().split(/\s+/).length : 0} words</span>
          </div>
        </div>

        {/* Style Selection Options */}
        <div className="text-editor-styles-row">
          <span className="style-label">Bold Design:</span>
          <div className="style-pills">
            <button
              type="button"
              className={`style-pill ${boldStyle === 'sans' ? 'active' : ''}`}
              onClick={() => setBoldStyle('sans')}
            >
              𝗕𝗼𝗹𝗱 𝗦𝗮𝗻𝘀
            </button>
            <button
              type="button"
              className={`style-pill ${boldStyle === 'serif' ? 'active' : ''}`}
              onClick={() => setBoldStyle('serif')}
            >
              𝐁𝐨𝐥𝐝 𝐒𝐞𝐫𝐢𝐟
            </button>
            <button
              type="button"
              className={`style-pill ${boldStyle === 'italic' ? 'active' : ''}`}
              onClick={() => setBoldStyle('italic')}
            >
              𝘽𝙤𝙡𝙙 𝙄𝘁𝗮𝗹𝙞𝙘
            </button>
          </div>
        </div>

        {/* Box for Bold Text Ready to Copy */}
        <div className="text-editor-section">
          <div className="text-editor-label-row">
            <label htmlFor="bold-box" className="text-editor-label">
              Bold Text (Ready to Copy)
            </label>
            {boldText && (
              <span className="text-ready-indicator">Ready to paste anywhere</span>
            )}
          </div>

          <textarea
            id="bold-box"
            className="text-editor-textarea bold-output-box"
            placeholder="Bold text output will appear here..."
            value={boldText}
            readOnly
            rows={4}
          />

          {/* Under box: Copy Button */}
          <div className="text-editor-bottom-controls">
            <button
              type="button"
              className={`btn btn-copy-bold ${copied ? 'copied' : ''}`}
              onClick={handleCopy}
              disabled={!boldText}
            >
              {copied ? (
                <>
                  <Check size={18} className="copy-icon-animate" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy size={18} />
                  <span>Copy Bold Text</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextEditor;
