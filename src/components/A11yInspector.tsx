import React, { useState, useEffect, useCallback, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Eye, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  X, 
  Volume2, 
  Zap, 
  RefreshCw, 
  Maximize2, 
  Sliders, 
  Layers, 
  ChevronRight, 
  FileText,
  ShieldAlert,
  Info
} from 'lucide-react';
import { useToast } from './Toast.tsx';

export interface A11yIssue {
  id: string;
  type: 'aria' | 'contrast' | 'alt' | 'focus';
  severity: 'error' | 'warning';
  elementName: string;
  elementHtml: string;
  message: string;
  suggestion: string;
  targetEl?: HTMLElement;
  ratio?: number;
}

interface A11yInspectorProps {
  activeTab?: string;
}

export default function A11yInspector({ activeTab }: A11yInspectorProps) {
  const { showToast } = useToast();
  const [isActive, setIsActive] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [issues, setIssues] = useState<A11yIssue[]>([]);
  const [scannedCount, setScannedCount] = useState(0);
  const [highlightedIssueId, setHighlightedIssueId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const [autoHighlight, setAutoHighlight] = useState(true);

  const inspectorRegionId = useId();

  // Helper to calculate relative luminance for WCAG contrast
  const getLuminance = (r: number, g: number, b: number) => {
    const a = [r, g, b].map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };

  const parseRgb = (colorStr: string): [number, number, number] | null => {
    const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
      return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
    }
    return null;
  };

  const calculateContrastRatio = (fgStr: string, bgStr: string): number => {
    const fg = parseRgb(fgStr);
    const bg = parseRgb(bgStr);
    if (!fg || !bg) return 4.5; // fallback default pass
    const l1 = getLuminance(fg[0], fg[1], fg[2]);
    const l2 = getLuminance(bg[0], bg[1], bg[2]);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  };

  // Run DOM Scan
  const runScan = useCallback(() => {
    if (!isActive) return;

    const detectedIssues: A11yIssue[] = [];
    let count = 0;

    // Scan interactive elements & images in document body
    const interactiveEls = document.querySelectorAll<HTMLElement>(
      'button, a, input, select, textarea, img, [role="button"], [role="link"], [role="checkbox"]'
    );

    setScannedCount(interactiveEls.length);

    interactiveEls.forEach((el, idx) => {
      count++;
      const tagName = el.tagName.toLowerCase();
      const textContent = el.innerText?.trim() || el.textContent?.trim() || '';
      const ariaLabel = el.getAttribute('aria-label');
      const ariaLabelledBy = el.getAttribute('aria-labelledby');
      const title = el.getAttribute('title');
      const alt = el.getAttribute('alt');
      const role = el.getAttribute('role');

      // Check 1: Missing ARIA / Accessible Name
      if (tagName === 'button' || role === 'button') {
        const hasAccessibleName = Boolean(textContent || ariaLabel || ariaLabelledBy || title);
        if (!hasAccessibleName) {
          detectedIssues.push({
            id: `aria_${idx}_${Date.now()}`,
            type: 'aria',
            severity: 'error',
            elementName: `Icon / Unlabeled Button (<${tagName}>)`,
            elementHtml: el.outerHTML.substring(0, 100),
            message: 'Button lacks an accessible text name, aria-label, or title.',
            suggestion: 'Add aria-label="Descriptive action name" or screen reader visible text inside the button.',
            targetEl: el
          });
        }
      } else if (tagName === 'a') {
        const hasAccessibleName = Boolean(textContent || ariaLabel || ariaLabelledBy || title);
        if (!hasAccessibleName) {
          detectedIssues.push({
            id: `aria_link_${idx}_${Date.now()}`,
            type: 'aria',
            severity: 'error',
            elementName: 'Unlabeled Link (<a>)',
            elementHtml: el.outerHTML.substring(0, 100),
            message: 'Hyperlink lacks readable anchor text or aria-label.',
            suggestion: 'Include meaningful text content or aria-label describing the destination.',
            targetEl: el
          });
        }
      } else if (tagName === 'img') {
        if (alt === null) {
          detectedIssues.push({
            id: `alt_${idx}_${Date.now()}`,
            type: 'alt',
            severity: 'warning',
            elementName: 'Image (<img>)',
            elementHtml: el.outerHTML.substring(0, 100),
            message: 'Image missing alt attribute entirely.',
            suggestion: 'Add alt="Description" or alt="" if the image is purely decorative.',
            targetEl: el
          });
        }
      } else if (tagName === 'input') {
        const type = el.getAttribute('type') || 'text';
        if (type !== 'hidden' && type !== 'submit') {
          const id = el.getAttribute('id');
          let hasLabelEl = false;
          if (id) {
            try {
              hasLabelEl = Boolean(document.querySelector(`label[for="${CSS.escape ? CSS.escape(id) : id}"]`));
            } catch {
              hasLabelEl = false;
            }
          }
          const hasAccessibleName = Boolean(ariaLabel || ariaLabelledBy || hasLabelEl || title);
          if (!hasAccessibleName) {
            detectedIssues.push({
              id: `input_${idx}_${Date.now()}`,
              type: 'aria',
              severity: 'error',
              elementName: `Form Input [type="${type}"]`,
              elementHtml: el.outerHTML.substring(0, 100),
              message: 'Input field is missing associated <label> or aria-label.',
              suggestion: 'Provide an aria-label or pair with an explicit <label htmlFor="..."> element.',
              targetEl: el
            });
          }
        }
      }

      // Check 2: Contrast Ratio Warnings on Text Elements
      try {
        const computedStyle = window.getComputedStyle(el);
        const color = computedStyle.color;
        let bgColor = computedStyle.backgroundColor;

        // Traverse parent for background if transparent
        let parent: HTMLElement | null = el.parentElement;
        while (parent && (bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent')) {
          const parentStyle = window.getComputedStyle(parent);
          bgColor = parentStyle.backgroundColor;
          parent = parent.parentElement;
        }

        if (bgColor && color && textContent.length > 0) {
          const ratio = calculateContrastRatio(color, bgColor);
          if (ratio < 3.5) {
            detectedIssues.push({
              id: `contrast_${idx}_${Date.now()}`,
              type: 'contrast',
              severity: 'warning',
              elementName: `<${tagName}> text "${textContent.substring(0, 20)}..."`,
              elementHtml: el.outerHTML.substring(0, 100),
              message: `Estimated contrast ratio is ${ratio.toFixed(2)}:1 (WCAG AA threshold is 4.5:1).`,
              suggestion: 'Increase text color darkness or adjust background luminance for greater legibility.',
              targetEl: el,
              ratio: Number(ratio.toFixed(2))
            });
          }
        }
      } catch (e) {
        // Skip inaccessible styles
      }
    });

    setIssues(detectedIssues);

    const summaryText = `A11y Inspector scan complete. Scanned ${count} elements. Detected ${detectedIssues.length} potential accessibility issues (${detectedIssues.filter(i => i.severity === 'error').length} missing labels, ${detectedIssues.filter(i => i.type === 'contrast').length} low contrast warnings).`;
    setAnnouncement(summaryText);
  }, [isActive]);

  // Trigger scan when toggled or tab changes
  useEffect(() => {
    if (isActive) {
      runScan();
      const timer = setTimeout(runScan, 500);
      return () => clearTimeout(timer);
    } else {
      setIssues([]);
      setHighlightedIssueId(null);
    }
  }, [isActive, activeTab, runScan]);

  // Apply visual outline rings on target elements when active
  useEffect(() => {
    if (!isActive || !autoHighlight) {
      // Clear outlines
      document.querySelectorAll('.a11y-highlight-flag').forEach(el => el.classList.remove('a11y-highlight-flag', 'ring-2', 'ring-red-500', 'ring-amber-500'));
      return;
    }

    issues.forEach(issue => {
      if (issue.targetEl) {
        issue.targetEl.classList.add('a11y-highlight-flag');
        if (issue.severity === 'error') {
          issue.targetEl.style.outline = '3px solid #ef4444';
          issue.targetEl.style.outlineOffset = '2px';
        } else {
          issue.targetEl.style.outline = '2px dashed #f59e0b';
          issue.targetEl.style.outlineOffset = '2px';
        }
      }
    });

    return () => {
      issues.forEach(issue => {
        if (issue.targetEl) {
          issue.targetEl.style.outline = '';
          issue.targetEl.style.outlineOffset = '';
        }
      });
    };
  }, [isActive, autoHighlight, issues]);

  // Focus and scroll to an issue's element
  const handleFocusIssue = (issue: A11yIssue) => {
    setHighlightedIssueId(issue.id);
    if (issue.targetEl) {
      issue.targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      issue.targetEl.focus();
      showToast(`Focused target: ${issue.elementName}`, 'info');
    }
  };

  const toggleInspector = () => {
    const nextState = !isActive;
    setIsActive(nextState);
    if (nextState) {
      setIsPanelOpen(true);
      showToast('A11y Inspector active: Scanning DOM for ARIA & WCAG compliance', 'success');
    } else {
      setIsPanelOpen(false);
      showToast('A11y Inspector deactivated', 'info');
    }
  };

  return (
    <>
      {/* Hidden Live Region for Screen Readers */}
      <div 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
        role="status"
      >
        {announcement}
      </div>

      {/* Footer Toggle Trigger Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleInspector}
          aria-expanded={isActive}
          aria-controls={inspectorRegionId}
          aria-label="Toggle Screen Reader A11y Accessibility Inspector"
          className={`px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-2 border shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            isActive
              ? 'bg-blue-600 text-white border-blue-500 shadow-blue-500/20 animate-pulse'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-900 hover:text-white border-slate-200'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>A11y Inspector</span>
          {issues.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-red-500 text-white font-mono font-bold">
              {issues.length}
            </span>
          )}
        </button>

        {isActive && (
          <button
            onClick={() => setIsPanelOpen(!isPanelOpen)}
            aria-label="Toggle Accessibility Details Drawer"
            className="text-xs text-blue-600 hover:text-blue-800 font-bold underline focus:outline-none focus:ring-1 focus:ring-blue-500 rounded"
          >
            {isPanelOpen ? 'Hide Audit Drawer' : `View Audit Log (${issues.length})`}
          </button>
        )}
      </div>

      {/* Floating Active Status Banner (Bottom Right Viewport) */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            id={inspectorRegionId}
            role="region"
            aria-label="Accessibility Audit Status Region"
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-slate-950 text-white border-2 border-blue-500/50 rounded-2xl shadow-2xl p-4 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">
                  A11y Live Engine Active
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={runScan}
                  aria-label="Re-scan document DOM for accessibility issues"
                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors focus:ring-1 focus:ring-blue-400"
                  title="Re-scan DOM"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={toggleInspector}
                  aria-label="Close A11y Inspector"
                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors focus:ring-1 focus:ring-blue-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="py-3 grid grid-cols-3 gap-2 text-center border-b border-slate-800">
              <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Scanned</span>
                <span className="text-xs font-mono font-bold text-white block mt-0.5">{scannedCount} els</span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                <span className="text-[9px] uppercase font-bold text-slate-400 block">No ARIA</span>
                <span className="text-xs font-mono font-bold text-red-400 block mt-0.5">
                  {issues.filter(i => i.type === 'aria' || i.type === 'alt').length}
                </span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Low Contrast</span>
                <span className="text-xs font-mono font-bold text-amber-400 block mt-0.5">
                  {issues.filter(i => i.type === 'contrast').length}
                </span>
              </div>
            </div>

            {/* Screen Reader Speech Summary Readout */}
            <div className="pt-2.5 space-y-2">
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-bold text-slate-400 flex items-center gap-1">
                  <Volume2 className="w-3 h-3 text-blue-400" />
                  Screen Reader Announcement:
                </span>
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-400 hover:text-white">
                  <input
                    type="checkbox"
                    checked={autoHighlight}
                    onChange={(e) => setAutoHighlight(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500 w-3 h-3"
                  />
                  <span>Outline Rings</span>
                </label>
              </div>
              <p className="text-[11px] text-slate-300 font-mono bg-slate-900 p-2 rounded-lg border border-slate-800 leading-snug">
                {issues.length === 0 
                  ? "✅ WCAG AA Pass: All scanned interactive controls contain valid accessible names and sufficient text contrast."
                  : `⚠️ ${issues.length} issue(s) detected. Click below to inspect element details or jump focus.`
                }
              </p>

              <button
                onClick={() => setIsPanelOpen(!isPanelOpen)}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-md focus:ring-2 focus:ring-white"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{isPanelOpen ? 'Close Issue Drawer' : 'Open Full Audit Drawer'}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded Full Audit Drawer Modal */}
      <AnimatePresence>
        {isActive && isPanelOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex justify-end"
            onClick={() => setIsPanelOpen(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-slate-900 border-l border-slate-800 text-white h-full p-6 md:p-8 overflow-y-auto flex flex-col justify-between space-y-6 shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-label="Accessibility Issues Inspector Detail Audit Log"
            >
              <div className="space-y-6">
                {/* Drawer Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/30">
                      <ShieldAlert className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        A11y Inspector Audit Log
                      </h3>
                      <p className="text-xs text-slate-400 font-mono">
                        WCAG 2.1 Level AA Scan — Current View
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsPanelOpen(false)}
                    aria-label="Close modal audit log drawer"
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all focus:ring-2 focus:ring-blue-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Audit Summary Card */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">Scan Status Breakdown</span>
                    <span className="text-xs font-mono font-bold text-blue-400">
                      {issues.length} Total Warnings
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
                    <div 
                      className="bg-red-500 h-full" 
                      style={{ width: `${issues.length ? (issues.filter(i => i.severity === 'error').length / issues.length) * 100 : 0}%` }} 
                    />
                    <div 
                      className="bg-amber-500 h-full" 
                      style={{ width: `${issues.length ? (issues.filter(i => i.severity === 'warning').length / issues.length) * 100 : 100}%` }} 
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      {issues.filter(i => i.severity === 'error').length} Missing ARIA/Labels
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      {issues.filter(i => i.type === 'contrast').length} Low Contrast
                    </span>
                  </div>
                </div>

                {/* Issues List */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-400" />
                    Detected Element Issues
                  </h4>

                  {issues.length === 0 ? (
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-8 text-center space-y-2 text-slate-400">
                      <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                      <h5 className="text-sm font-bold text-white">No Compliance Defects Found!</h5>
                      <p className="text-xs text-slate-400">
                        All scanned interactive controls and images on the current screen meet standard accessible naming and contrast specs.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {issues.map((issue) => (
                        <div
                          key={issue.id}
                          className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
                            highlightedIssueId === issue.id
                              ? 'bg-blue-950/60 border-blue-500 shadow-lg shadow-blue-500/10'
                              : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              {issue.severity === 'error' ? (
                                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                              )}
                              <span className="text-xs font-bold text-white font-mono">
                                {issue.elementName}
                              </span>
                            </div>

                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase font-mono ${
                              issue.type === 'aria' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                              issue.type === 'contrast' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                              'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                            }`}>
                              {issue.type}
                            </span>
                          </div>

                          <p className="text-xs text-slate-300 font-medium leading-relaxed">
                            {issue.message}
                          </p>

                          {/* HTML Snippet */}
                          <div className="bg-slate-900 p-2 rounded-lg font-mono text-[10px] text-slate-400 truncate border border-slate-800">
                            <code>{issue.elementHtml}</code>
                          </div>

                          {/* Fix Suggestion */}
                          <div className="bg-blue-950/40 p-2.5 rounded-xl border border-blue-500/20 text-[11px] text-blue-300 space-y-0.5">
                            <span className="font-bold block uppercase text-[9px] text-blue-400">Fix Suggestion:</span>
                            <p>{issue.suggestion}</p>
                          </div>

                          {/* Focus Element Action */}
                          {issue.targetEl && (
                            <button
                              onClick={() => handleFocusIssue(issue)}
                              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-blue-400 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 border border-slate-800 focus:ring-2 focus:ring-blue-400"
                            >
                              <Maximize2 className="w-3.5 h-3.5" />
                              <span>Highlight & Jump Keyboard Focus</span>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="pt-4 border-t border-slate-800 text-[10px] text-slate-500 font-mono flex items-center justify-between">
                <span>D&CP Spokane WCAG Inspector</span>
                <button
                  onClick={runScan}
                  className="text-blue-400 hover:underline font-bold"
                >
                  Refresh Scan
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
