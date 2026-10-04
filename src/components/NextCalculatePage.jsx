import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import html2canvas from 'html2canvas';
import {
  ArrowLeft,
  Plus,
  Trash2,
  RotateCcw,
  Coins,
  Camera,
  Check,
  Loader2,
  X,
  AlertTriangle,
  Calendar
} from 'lucide-react';

const INITIAL_GROUPS = [
  {
    id: 'group-1',
    thb: '1500',
    rows: [
      { id: 'row-1', name: 'Aung', kyats: '20000' },
      { id: 'row-2', name: 'Min', kyats: '30000' }
    ]
  }
];

const NextCalculatePage = ({ onBack }) => {
  const [groups, setGroups] = useState(() => {
    try {
      const saved = localStorage.getItem('net_calc_thb_groups');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_GROUPS;
  });

  // Calculation date state (defaults to current date, editable, synced)
  const getTodayDateStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [calcDate, setCalcDate] = useState(() => {
    try {
      const saved = localStorage.getItem('net_calc_date');
      if (saved) return saved;
    } catch {
      // fallback
    }
    return getTodayDateStr();
  });

  useEffect(() => {
    try {
      localStorage.setItem('net_calc_date', calcDate);
    } catch {
      // Ignore quota error
    }
  }, [calcDate]);

  const formattedDate = useMemo(() => {
    if (!calcDate) return '';
    const parts = calcDate.split('-');
    if (parts.length !== 3) return calcDate;
    const [y, m, d] = parts.map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }, [calcDate]);

  // State for image export
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageSaved, setImageSaved] = useState(false);
  const screenshotRef = useRef(null);

  // State for delete confirmation modal
  // { type: 'row' | 'group' | 'reset', groupId, rowId, title, message }
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('net_calc_thb_groups', JSON.stringify(groups));
    } catch {
      // Ignore quota error
    }
  }, [groups]);

  // Format number with commas
  const formatNumber = (val) => {
    if (val === '' || val === null || val === undefined) return '0';
    const num = parseFloat(val);
    if (isNaN(num)) return '0';
    return Math.round(num).toLocaleString('en-US');
  };

  // Add new THB group
  const handleAddGroup = () => {
    const newGroup = {
      id: `group-${Date.now()}`,
      thb: '',
      rows: [{ id: `row-${Date.now()}-1`, name: '', kyats: '' }]
    };
    setGroups(prev => [...prev, newGroup]);
  };

  // Delete an entire THB group
  const executeDeleteGroup = useCallback((groupId) => {
    setGroups(prev => {
      if (prev.length <= 1) {
        return [{
          id: `group-${Date.now()}`,
          thb: '',
          rows: [{ id: `row-${Date.now()}`, name: '', kyats: '' }]
        }];
      }
      return prev.filter(g => g.id !== groupId);
    });
  }, []);

  // Update Group THB
  const handleGroupThbChange = (groupId, value) => {
    const clean = value.replace(/[^0-9.]/g, '');
    setGroups(prev =>
      prev.map(g => (g.id === groupId ? { ...g, thb: clean } : g))
    );
  };

  // Add a row within a group
  const handleAddRow = (groupId) => {
    const newRow = {
      id: `row-${Date.now()}`,
      name: '',
      kyats: ''
    };
    setGroups(prev =>
      prev.map(g => {
        if (g.id === groupId) {
          return { ...g, rows: [...g.rows, newRow] };
        }
        return g;
      })
    );
  };

  // Delete a row
  const executeDeleteRow = useCallback((groupId, rowId) => {
    setGroups(prev =>
      prev.map(g => {
        if (g.id === groupId) {
          if (g.rows.length <= 1) {
            return {
              ...g,
              rows: [{ id: `row-${Date.now()}`, name: '', kyats: '' }]
            };
          }
          return { ...g, rows: g.rows.filter(r => r.id !== rowId) };
        }
        return g;
      })
    );
  }, []);

  // Update row Name or Kyats
  const handleRowChange = (groupId, rowId, field, value) => {
    let cleanVal = value;
    if (field === 'kyats') {
      cleanVal = value.replace(/[^0-9.]/g, '');
    }
    setGroups(prev =>
      prev.map(g => {
        if (g.id === groupId) {
          return {
            ...g,
            rows: g.rows.map(r =>
              r.id === rowId ? { ...r, [field]: cleanVal } : r
            )
          };
        }
        return g;
      })
    );
  };

  // Prevent accidental submit or keyboard jumping on enter
  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.target.blur();
    }
  };

  // Prompt confirmation for deleting a row
  const promptDeleteRow = (groupId, rowId, rowName) => {
    setDeleteConfirm({
      type: 'row',
      groupId,
      rowId,
      title: 'Delete Row',
      message: rowName?.trim()
        ? `Are you sure you want to delete "${rowName.trim()}"?`
        : 'Are you sure you want to delete this row?'
    });
  };

  // Prompt confirmation for deleting a group
  const promptDeleteGroup = (groupId, groupIdx) => {
    setDeleteConfirm({
      type: 'group',
      groupId,
      title: 'Delete Group',
      message: `Are you sure you want to delete Group ${groupIdx + 1} and all its member rows?`
    });
  };

  // State for clean permission modal
  const [isCleanModalOpen, setIsCleanModalOpen] = useState(false);

  // Execute confirmed clean (resets data in state and LocalStorage)
  const handleConfirmClean = useCallback(() => {
    const cleanGroup = [
      {
        id: `group-${Date.now()}`,
        thb: '',
        rows: [{ id: `row-${Date.now()}-1`, name: '', kyats: '' }]
      }
    ];
    setGroups(cleanGroup);
    setCalcDate(getTodayDateStr());
    try {
      localStorage.setItem('net_calc_thb_groups', JSON.stringify(cleanGroup));
      localStorage.setItem('net_calc_date', getTodayDateStr());
    } catch {
      // Ignore quota error
    }
    setIsCleanModalOpen(false);
  }, []);

  // Handle keyboard events for clean modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isCleanModalOpen) return;
      if (e.key === 'Escape') {
        setIsCleanModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCleanModalOpen]);

  // Execute confirmed row or group delete action
  const handleConfirmAction = useCallback(() => {
    if (!deleteConfirm) return;

    if (deleteConfirm.type === 'row') {
      executeDeleteRow(deleteConfirm.groupId, deleteConfirm.rowId);
    } else if (deleteConfirm.type === 'group') {
      executeDeleteGroup(deleteConfirm.groupId);
    }
    setDeleteConfirm(null);
  }, [deleteConfirm, executeDeleteRow, executeDeleteGroup]);

  // Handle keyboard events for delete modal (Escape closes, Enter confirms)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!deleteConfirm) return;
      if (e.key === 'Escape') {
        setDeleteConfirm(null);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleConfirmAction();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteConfirm, handleConfirmAction]);

  // Calculations for each group and grand totals
  const { totalThb, totalKyats, groupTotals } = useMemo(() => {
    let tThb = 0;
    let tKyats = 0;
    const gTotals = {};

    groups.forEach(g => {
      const gThbNum = parseFloat(g.thb) || 0;
      tThb += gThbNum;

      let gKyatsSum = 0;
      g.rows.forEach(r => {
        const kNum = parseFloat(r.kyats) || 0;
        gKyatsSum += kNum;
      });

      gTotals[g.id] = gKyatsSum;
      tKyats += gKyatsSum;
    });

    return {
      totalThb: tThb,
      totalKyats: tKyats,
      groupTotals: gTotals
    };
  }, [groups]);

  // Detect iOS (iPhone / iPad) for native Save to Photos
  const isIOS = typeof navigator !== 'undefined' && (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  ) && !window.MSStream;

  const canShareFiles = () => {
    try {
      return !!navigator.share && !!navigator.canShare;
    } catch {
      return false;
    }
  };

  // Export single unified table as high-res image (PNG)
  const handleExportImage = async () => {
    if (!screenshotRef.current || isGeneratingImage) return;
    setIsGeneratingImage(true);

    try {
      const originalEl = screenshotRef.current;

      const bodyStyles = window.getComputedStyle(document.body);
      const computedBg = bodyStyles.backgroundColor;
      const validBg = computedBg && computedBg !== 'rgba(0, 0, 0, 0)' && computedBg !== 'transparent'
        ? computedBg
        : '#ffffff';

      const canvas = await html2canvas(originalEl, {
        scale: 2, // 2x Retina resolution
        useCORS: true,
        logging: false,
        backgroundColor: validBg,
        onclone: (clonedDoc) => {
          const clonedSheet = clonedDoc.querySelector('.calc-screenshot-export-sheet');
          if (clonedSheet) {
            clonedSheet.style.position = 'static';
            clonedSheet.style.left = '0';
            clonedSheet.style.top = '0';
          }
        }
      });

      const filename = `Net_Calculate_${calcDate || 'export'}.png`;

      // Convert canvas to Blob
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('Canvas conversion to blob failed');

      const file = new File([blob], filename, { type: 'image/png' });

      // On iOS: trigger native Web Share sheet so user can tap "Save Image" to save directly to Photos
      if (isIOS && canShareFiles()) {
        try {
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: 'Net Calculate',
            });
            setImageSaved(true);
            setTimeout(() => setImageSaved(false), 2500);
            return;
          }
        } catch (shareErr) {
          if (shareErr.name === 'AbortError') {
            // User cancelled share sheet
            return;
          }
          console.warn('Native share failed, falling back to download:', shareErr);
        }
      }

      // Non-iOS or fallback: standard download
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = filename;
      link.href = blobUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);

      setImageSaved(true);
      setTimeout(() => setImageSaved(false), 2500);
    } catch (err) {
      console.error('Image export failed:', err);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Confirmation Modal JSX
  const confirmModalContent = deleteConfirm && (
    <div
      className="modal-overlay active"
      onClick={(e) => {
        if (e.target === e.currentTarget) setDeleteConfirm(null);
      }}
    >
      <div
        className="modal-content animate-fade-in calc-confirm-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="calc-confirm-title"
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="calc-confirm-icon-wrap">
              <AlertTriangle size={16} />
            </div>
            <span id="calc-confirm-title" className="modal-title">
              {deleteConfirm.title}
            </span>
          </div>
          <button
            type="button"
            className="modal-close"
            onClick={() => setDeleteConfirm(null)}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '1.25rem 1.5rem' }}>
          <p className="calc-confirm-message">
            {deleteConfirm.message}
          </p>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-glass"
            onClick={() => setDeleteConfirm(null)}
            style={{ minWidth: '85px', height: '38px', padding: '0 1rem' }}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn calc-confirm-delete-btn"
            onClick={handleConfirmAction}
            style={{ minWidth: '95px', height: '38px', padding: '0 1.25rem' }}
          >
            {deleteConfirm.type === 'reset' ? 'Reset' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );

  // Clean Permission Modal JSX (with screenshot button & confirmation)
  const cleanModalContent = isCleanModalOpen && (
    <div
      className="modal-overlay active"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsCleanModalOpen(false);
      }}
    >
      <div
        className="modal-content animate-fade-in calc-clean-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="clean-modal-title"
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="calc-clean-icon-wrap">
              <AlertTriangle size={18} />
            </div>
            <span id="clean-modal-title" className="modal-title">
              Clean Calculation Data
            </span>
          </div>
          <button
            type="button"
            className="modal-close"
            onClick={() => setIsCleanModalOpen(false)}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p className="calc-clean-description">
            All data is securely saved in your LocalStorage until you clean it. Confirming will clear all THB groups and member records.
          </p>

          <div className="calc-clean-screenshot-card">
            <div className="calc-clean-screenshot-text">
              <strong>Save a backup first?</strong>
              <span>Get a clean screenshot before clearing your records.</span>
            </div>
            <button
              type="button"
              className="btn btn-glass calc-modal-shot-btn"
              onClick={handleExportImage}
              disabled={isGeneratingImage}
              title="Get screenshot before clean"
            >
              {isGeneratingImage ? (
                <Loader2 size={14} className="animate-spin" />
              ) : imageSaved ? (
                <Check size={14} style={{ color: '#10b981' }} />
              ) : (
                <Camera size={14} />
              )}
              <span>{isGeneratingImage ? 'Capturing...' : imageSaved ? 'Saved!' : isIOS ? 'Save to Photos' : 'Get Screenshot'}</span>
            </button>
          </div>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <button
            type="button"
            className="btn btn-glass"
            onClick={() => setIsCleanModalOpen(false)}
            style={{ minWidth: '85px', height: '38px', padding: '0 1rem' }}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn calc-confirm-delete-btn"
            onClick={handleConfirmClean}
            style={{ minWidth: '120px', height: '38px', padding: '0 1.25rem' }}
          >
            Confirm Clean
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="next-calculate-page animate-fade-in">
      {/* Header Navigation */}
      <header className="next-calculate-header">
        <div className="next-calculate-header-inner">
          <button
            type="button"
            className="btn btn-glass btn-icon-only"
            onClick={onBack}
            title="Back to Calculator"
            aria-label="Back to Calculator"
            style={{ width: '38px', height: '38px', padding: 0 }}
          >
            <ArrowLeft size={17} />
          </button>

          <div className="next-calculate-title-wrap">
            <h2 className="next-calculate-title">Calculate</h2>
            <span className="next-calculate-header-date">{formattedDate}</span>
          </div>

          <div className="next-calculate-actions">
            {/* Get Image button (exports unified single table as clean image) */}
            <button
              type="button"
              className="btn btn-glass calc-get-image-btn"
              onClick={handleExportImage}
              disabled={isGeneratingImage}
              title="Get whole calculation as image"
              style={{ height: '36px', fontSize: '0.82rem', padding: '0 0.85rem' }}
            >
              {isGeneratingImage ? (
                <Loader2 size={14} className="animate-spin" />
              ) : imageSaved ? (
                <Check size={14} style={{ color: '#10b981' }} />
              ) : (
                <Camera size={14} />
              )}
              <span>{isGeneratingImage ? 'Capturing...' : imageSaved ? 'Saved!' : isIOS ? 'Save to Photos' : 'Get Image'}</span>
            </button>

            {/* Clean button with permission modal & screenshot option */}
            <button
              type="button"
              className="btn btn-glass btn-icon-only"
              onClick={() => setIsCleanModalOpen(true)}
              title="Clean Calculation Data"
              aria-label="Clean Calculation Data"
              style={{ width: '36px', height: '36px', padding: 0 }}
            >
              <RotateCcw size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area: Interactive Group Cards for Editing */}
      <main className="next-calculate-container">
        {/* THB Group Cards */}
        <div className="calc-groups-list">
          {groups.map((group, groupIdx) => {
            const subtotal = groupTotals[group.id] || 0;

            return (
              <section key={group.id} className="calc-group-card">
                {/* Group Card Top Bar */}
                <div className="calc-group-card-header">
                  <div className="calc-group-header-left">
                    <label className="calc-group-date-wrap" title="Click to change date">
                      <Calendar size={13} className="calc-date-icon" />
                      <span className="calc-date-text">{formattedDate}</span>
                      <input
                        type="date"
                        className="calc-date-input-overlay"
                        value={calcDate}
                        onChange={(e) => {
                          if (e.target.value) setCalcDate(e.target.value);
                        }}
                        aria-label="Change calculation date"
                      />
                    </label>
                  </div>

                  <div className="calc-group-header-right">
                    <div className="calc-group-subtotal-badge">
                      <span className="calc-subtotal-label">Subtotal:</span>
                      <strong className="calc-subtotal-val">{formatNumber(subtotal)} Ks</strong>
                    </div>
                    {groups.length > 1 && (
                      <button
                        type="button"
                        className="calc-del-btn calc-del-group-header-btn"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => promptDeleteGroup(group.id, groupIdx)}
                        title={`Delete Group ${groupIdx + 1}`}
                        aria-label={`Delete Group ${groupIdx + 1}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>

                {/* 3-Column Compact Rows Table */}
                <div className="calc-table-wrap">
                  <table className="calc-table">
                    <thead>
                      <tr className="calc-th-row">
                        <th className="calc-col-thb">Buy(THB)</th>
                        <th className="calc-col-name">Name</th>
                        <th className="calc-col-kyats">Sell(Kyats)</th>
                        <th className="calc-col-action"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.rows.map((row, rowIdx) => {
                        const isFirstRow = rowIdx === 0;

                        return (
                          <tr key={row.id} className="calc-data-row">
                            {/* 1st Column: THB Input on row 1, clean connector on subsequent rows */}
                            <td className="calc-td-thb">
                              {isFirstRow ? (
                                <div className="calc-thb-input-wrap">
                                  <input
                                    type="text"
                                    inputMode="decimal"
                                    enterKeyHint="done"
                                    className="calc-input calc-thb-input"
                                    placeholder="1234"
                                    value={group.thb}
                                    onChange={(e) =>
                                      handleGroupThbChange(group.id, e.target.value)
                                    }
                                    onKeyDown={handleInputKeyDown}
                                    aria-label={`Group ${groupIdx + 1} Buy THB`}
                                  />
                                </div>
                              ) : (
                                <div className="calc-thb-connect" aria-hidden="true">
                                  <span>↳</span>
                                </div>
                              )}
                            </td>

                            {/* 2nd Column: Name */}
                            <td className="calc-td-name">
                              <input
                                type="text"
                                enterKeyHint="done"
                                autoComplete="off"
                                autoCorrect="off"
                                spellCheck="false"
                                className="calc-input calc-name-input"
                                placeholder="Name"
                                value={row.name}
                                onChange={(e) =>
                                  handleRowChange(group.id, row.id, 'name', e.target.value)
                                }
                                onKeyDown={handleInputKeyDown}
                                aria-label={`Member name row ${rowIdx + 1}`}
                              />
                            </td>

                            {/* 3rd Column: Kyats */}
                            <td className="calc-td-kyats">
                              <input
                                type="text"
                                inputMode="numeric"
                                enterKeyHint="done"
                                className="calc-input calc-kyats-input"
                                placeholder="1234"
                                value={row.kyats}
                                onChange={(e) =>
                                  handleRowChange(group.id, row.id, 'kyats', e.target.value)
                                }
                                onKeyDown={handleInputKeyDown}
                                aria-label={`Sell Kyats amount row ${rowIdx + 1}`}
                              />
                            </td>

                            {/* 4th Column: Delete Row Button with confirmation */}
                            <td className="calc-td-action">
                              <button
                                type="button"
                                className="calc-del-btn"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => promptDeleteRow(group.id, row.id, row.name)}
                                title="Delete row"
                                aria-label={`Delete row ${rowIdx + 1}`}
                              >
                                <Trash2 size={15} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Group Card Footer: Add Row */}
                <div className="calc-group-card-footer">
                  <button
                    type="button"
                    className="calc-add-row-btn"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleAddRow(group.id)}
                  >
                    <Plus size={15} />
                    <span>Add Row</span>
                  </button>
                </div>
              </section>
            );
          })}
        </div>

        {/* Add Another THB Group Button */}
        <button
          type="button"
          className="calc-add-group-btn"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleAddGroup}
        >
          <Plus size={16} />
          <span>Add Another THB Group</span>
        </button>

        {/* Grand Total Summary Card (Interactive UI) */}
        <section className="calc-summary-card" aria-label="Calculation Grand Totals">
          <div className="calc-summary-grid-simple">
            <div className="calc-summary-col">
              <span className="calc-summary-label">
                <Coins size={14} className="calc-summary-icon" /> Total THB
              </span>
              <strong className="calc-summary-val">{formatNumber(totalThb)} THB</strong>
            </div>

            <div className="calc-summary-col calc-summary-col-grand">
              <span className="calc-summary-label">Grand Total</span>
              <strong className="calc-summary-val calc-summary-grand-accent">
                {formatNumber(totalKyats)} Ks
              </strong>
            </div>
          </div>
        </section>
      </main>

      {/* =========================================================================
          Dedicated Screenshot Template: ONE single continuous table,
          rows do not break into separate cards, Grand Total in table footer.
          ========================================================================= */}
      <div
        ref={screenshotRef}
        className="calc-screenshot-export-sheet"
        aria-hidden="true"
      >
        <div className="calc-shot-card">
          <div className="calc-shot-header">
            <h2 className="calc-shot-title">Net Calculate</h2>
            <span className="calc-shot-subtitle">
              Calculation Breakdown • {formattedDate}
            </span>
          </div>

          <table className="calc-shot-table">
            <thead>
              <tr className="calc-shot-th-row">
                <th className="calc-shot-col-thb">Buy(THB)</th>
                <th className="calc-shot-col-name">Name</th>
                <th className="calc-shot-col-kyats">Sell(Kyats)</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((group) => {
                const subtotal = groupTotals[group.id] || 0;
                const hasMultipleRows = group.rows.length > 1;

                return (
                  <React.Fragment key={group.id}>
                    {group.rows.map((row, rowIdx) => {
                      const isFirstRow = rowIdx === 0;

                      return (
                        <tr key={row.id} className="calc-shot-row">
                          {/* Buy THB Column */}
                          <td className="calc-shot-td-thb">
                            {isFirstRow ? (
                              <span className="calc-shot-thb-val">
                                {group.thb ? formatNumber(group.thb) : '—'}
                              </span>
                            ) : (
                              <span className="calc-shot-connect">↳</span>
                            )}
                          </td>

                          {/* Name Column */}
                          <td className="calc-shot-td-name">
                            <span className="calc-shot-name-val">
                              {row.name.trim() || '—'}
                            </span>
                          </td>

                          {/* Sell Kyats Column */}
                          <td className="calc-shot-td-kyats">
                            <span className="calc-shot-kyats-val">
                              {row.kyats ? formatNumber(row.kyats) : '0'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}

                    {/* Subtotal line for groups with multiple rows */}
                    {hasMultipleRows && (
                      <tr className="calc-shot-subtotal-row">
                        <td colSpan={2} className="calc-shot-subtotal-label">
                          Subtotal:
                        </td>
                        <td className="calc-shot-subtotal-val">
                          {formatNumber(subtotal)} Ks
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>

            {/* Total shown directly in Table Footer */}
            <tfoot className="calc-shot-tfoot">
              <tr className="calc-shot-foot-row">
                <td className="calc-shot-foot-thb">
                  <span className="calc-shot-foot-label">Total THB</span>
                  <strong className="calc-shot-foot-val">{formatNumber(totalThb)} THB</strong>
                </td>
                <td className="calc-shot-foot-empty"></td>
                <td className="calc-shot-foot-kyats">
                  <span className="calc-shot-foot-label">Grand Total</span>
                  <strong className="calc-shot-foot-grand">{formatNumber(totalKyats)} Ks</strong>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Portal Delete Confirmation Modal */}
      {typeof document !== 'undefined' && confirmModalContent && createPortal(confirmModalContent, document.body)}

      {/* Portal Clean Permission Modal with Screenshot Action */}
      {typeof document !== 'undefined' && cleanModalContent && createPortal(cleanModalContent, document.body)}
    </div>
  );
};

export default NextCalculatePage;
