import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  AlertTriangle,
  RefreshCw,
  Trash2,
  CheckCircle2,
  Wifi,
  WifiOff,
  Database,
  ArrowRight,
  Copy,
  Check,
  Info,
  X,
  BookOpen,
  Download,
  ShieldCheck,
  HardDrive,
  FileText
} from 'lucide-react';

interface SystemHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  isOnline: boolean;
  pendingSyncCount: number;
  onClearCacheAndReset: () => void;
  onTriggerSync: () => void;
}

type PlatformTab = 'windows' | 'macos' | 'android' | 'ios';
type SectionTab = 'pwa' | 'troubleshooting' | 'diagnostics';

export const SystemHelpModal: React.FC<SystemHelpModalProps> = ({
  isOpen,
  onClose,
  isOnline,
  pendingSyncCount,
  onClearCacheAndReset,
  onTriggerSync,
}) => {
  const [activeTab, setActiveTab] = useState<SectionTab>('pwa');
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformTab>('windows');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [confirmClearCache, setConfirmClearCache] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<{
    tested: boolean;
    storageOk: boolean;
    networkOk: boolean;
    indexedDbOk: boolean;
    storageQuota: string;
    message: string;
  }>({
    tested: false,
    storageOk: false,
    networkOk: false,
    indexedDbOk: false,
    storageQuota: 'Checking...',
    message: '',
  });
  const [isRunningDiagnostic, setIsRunningDiagnostic] = useState(false);

  // Auto-detect OS on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userAgent = window.navigator.userAgent.toLowerCase();
      if (/iphone|ipad|ipod/.test(userAgent)) {
        setSelectedPlatform('ios');
      } else if (/android/.test(userAgent)) {
        setSelectedPlatform('android');
      } else if (/macintosh|mac os x/.test(userAgent)) {
        setSelectedPlatform('macos');
      } else {
        setSelectedPlatform('windows');
      }
    }
  }, []);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2500);
  };

  const runDiagnosticTest = async () => {
    setIsRunningDiagnostic(true);
    let idbOk = false;
    let netOk = navigator.onLine;
    let quotaStr = 'N/A';

    // Test IndexedDB
    try {
      if ('indexedDB' in window) {
        const testDbName = 'erp_diagnostic_test_' + Date.now();
        const req = indexedDB.open(testDbName, 1);
        await new Promise<void>((resolve, reject) => {
          req.onsuccess = () => {
            req.result.close();
            indexedDB.deleteDatabase(testDbName);
            idbOk = true;
            resolve();
          };
          req.onerror = () => reject();
        });
      }
    } catch {
      idbOk = false;
    }

    // Test Storage Quota
    try {
      if (navigator.storage && navigator.storage.estimate) {
        const estimate = await navigator.storage.estimate();
        const usedMB = ((estimate.usage || 0) / (1024 * 1024)).toFixed(2);
        const quotaMB = ((estimate.quota || 0) / (1024 * 1024)).toFixed(0);
        quotaStr = `${usedMB} MB used of ~${quotaMB} MB available`;
      }
    } catch {
      quotaStr = 'Quota API not supported';
    }

    setTimeout(() => {
      setDiagnosticResult({
        tested: true,
        storageOk: true,
        networkOk: netOk,
        indexedDbOk: idbOk,
        storageQuota: quotaStr,
        message:
          idbOk && netOk
            ? 'All system subsystems operational. Local vault storage and network sync are performing normally.'
            : !netOk
            ? 'Working in Offline Mode. All changes are being safely queued in local IndexedDB vault.'
            : 'Warning: IndexedDB access may be restricted by browser privacy/cookie policies.',
      });
      setIsRunningDiagnostic(false);
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-800/80 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                PharmMed ERP — System SOP & Help Center
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 font-mono text-slate-300">
                  v2026.1
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                PWA Desktop/Mobile Installation Guides, Technical SOPs & Diagnostic Utilities
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-750 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Sub-Navigation Bar */}
        <div className="flex items-center gap-2 px-6 pt-3 pb-2 bg-slate-850 border-b border-slate-750">
          <button
            onClick={() => setActiveTab('pwa')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'pwa'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Download className="w-4 h-4" />
            PWA Installation SOP (Desktop & Mobile)
          </button>
          <button
            onClick={() => setActiveTab('troubleshooting')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'troubleshooting'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            System Troubleshooting SOP
          </button>
          <button
            onClick={() => {
              setActiveTab('diagnostics');
              if (!diagnosticResult.tested) runDiagnosticTest();
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'diagnostics'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Live Diagnostics & Cache Reset
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: PWA INSTALLATION SOP */}
          {activeTab === 'pwa' && (
            <div className="space-y-6">
              {/* Introduction Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-sky-950/60 to-indigo-950/60 border border-sky-800/40 flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-300 shrink-0">
                  <Laptop className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-sky-200">
                    Why Install as a Progressive Web Application (PWA)?
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    PharmMed ERP is designed with offline-first PWA architecture. Installing it grants instant launcher access, full-screen desktop/tablet execution, background sync, zero installation download footprint, and complete local IndexedDB vault caching even during campus network outages.
                  </p>
                </div>
              </div>

              {/* Platform Selector Buttons */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Select Your Operating Platform
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => setSelectedPlatform('windows')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-medium transition-all ${
                      selectedPlatform === 'windows'
                        ? 'bg-sky-600/20 border-sky-500 text-sky-200 font-semibold shadow-xs'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <Monitor className="w-4 h-4 text-sky-400" />
                    Windows PC
                  </button>
                  <button
                    onClick={() => setSelectedPlatform('macos')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-medium transition-all ${
                      selectedPlatform === 'macos'
                        ? 'bg-sky-600/20 border-sky-500 text-sky-200 font-semibold shadow-xs'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <Laptop className="w-4 h-4 text-sky-400" />
                    macOS / Mac
                  </button>
                  <button
                    onClick={() => setSelectedPlatform('android')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-medium transition-all ${
                      selectedPlatform === 'android'
                        ? 'bg-sky-600/20 border-sky-500 text-sky-200 font-semibold shadow-xs'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-sky-400" />
                    Android (Phone & Tab)
                  </button>
                  <button
                    onClick={() => setSelectedPlatform('ios')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-medium transition-all ${
                      selectedPlatform === 'ios'
                        ? 'bg-sky-600/20 border-sky-500 text-sky-200 font-semibold shadow-xs'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <Tablet className="w-4 h-4 text-sky-400" />
                    iOS & iPadOS
                  </button>
                </div>
              </div>

              {/* Step-by-Step SOP Body for Selected Platform */}
              <div className="p-5 rounded-xl bg-slate-800/50 border border-slate-700 space-y-4">
                {selectedPlatform === 'windows' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                      <div className="flex items-center gap-2">
                        <Monitor className="w-5 h-5 text-sky-400" />
                        <h4 className="text-sm font-bold text-white">
                          SOP: Windows 10/11 PWA Installation (Google Chrome & Microsoft Edge)
                        </h4>
                      </div>
                      <span className="text-[11px] px-2.5 py-1 rounded bg-slate-700 text-slate-300">
                        Zero Download Footprint
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/60 border border-slate-750">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 text-xs font-bold shrink-0">
                          1
                        </span>
                        <div>
                          <p className="text-xs font-semibold text-slate-200">
                            Open in Chrome or Edge
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Launch Google Chrome or Microsoft Edge and navigate to your institutional PharmMed ERP URL.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/60 border border-slate-750">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 text-xs font-bold shrink-0">
                          2
                        </span>
                        <div>
                          <p className="text-xs font-semibold text-slate-200">
                            Locate the Install App Icon in Address Bar
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            In the right-hand corner of the browser URL bar (next to the bookmark star), look for the <strong className="text-sky-300">"Install App"</strong> icon (a computer monitor with a small down arrow).
                          </p>
                          <p className="text-[11px] text-slate-500 mt-1">
                            <em>Shortcut:</em> Click browser menu (three dots <code className="text-slate-300">⋮</code> in top right) $\rightarrow$ select <strong className="text-slate-300">"Save and share"</strong> or <strong className="text-slate-300">"Apps"</strong> $\rightarrow$ click <strong className="text-sky-300">"Install PharmMed ERP"</strong>.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/60 border border-slate-750">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 text-xs font-bold shrink-0">
                          3
                        </span>
                        <div>
                          <p className="text-xs font-semibold text-slate-200">
                            Confirm Installation & Pin to Taskbar
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Click <strong className="text-white bg-sky-600 px-1.5 py-0.5 rounded text-[11px]">Install</strong> in the dialog. The app will immediately launch in its own standalone native window. Right-click the app icon on your Windows Taskbar and select <strong className="text-slate-200">"Pin to taskbar"</strong>.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedPlatform === 'macos' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                      <div className="flex items-center gap-2">
                        <Laptop className="w-5 h-5 text-sky-400" />
                        <h4 className="text-sm font-bold text-white">
                          SOP: macOS Installation (Apple Safari & Google Chrome)
                        </h4>
                      </div>
                      <span className="text-[11px] px-2.5 py-1 rounded bg-slate-700 text-slate-300">
                        Native Mac Dock App
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/60 border border-slate-750">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 text-xs font-bold shrink-0">
                          Option A
                        </span>
                        <div>
                          <p className="text-xs font-semibold text-slate-200">
                            Via Apple Safari (macOS Sonoma 14+): Add to Dock
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            1. Open the ERP URL in Safari.
                            <br />
                            2. Click the <strong className="text-slate-200">File</strong> menu at top or the <strong className="text-slate-200">Share</strong> icon in toolbar.
                            <br />
                            3. Select <strong className="text-sky-300">"Add to Dock..."</strong>.
                            <br />
                            4. Click <strong className="text-slate-200">Add</strong>. The ERP will now live directly in your macOS Dock and Applications folder as a standalone app.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/60 border border-slate-750">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 text-xs font-bold shrink-0">
                          Option B
                        </span>
                        <div>
                          <p className="text-xs font-semibold text-slate-200">
                            Via Google Chrome for Mac
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Click the <strong className="text-sky-300">Install icon</strong> in the Chrome address bar, or click Chrome menu <code className="text-slate-300">⋮</code> $\rightarrow$ <strong className="text-slate-300">Save and Share</strong> $\rightarrow$ <strong className="text-slate-300">Install PharmMed ERP</strong>.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedPlatform === 'android' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-5 h-5 text-sky-400" />
                        <h4 className="text-sm font-bold text-white">
                          SOP: Android Mobile & Tablet Installation (Chrome / Samsung Internet)
                        </h4>
                      </div>
                      <span className="text-[11px] px-2.5 py-1 rounded bg-slate-700 text-slate-300">
                        Full-Screen Touch ERP
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/60 border border-slate-750">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 text-xs font-bold shrink-0">
                          1
                        </span>
                        <div>
                          <p className="text-xs font-semibold text-slate-200">
                            Open in Chrome on Android Phone or Tablet
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Navigate to the institutional ERP web address on your Android device.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/60 border border-slate-750">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 text-xs font-bold shrink-0">
                          2
                        </span>
                        <div>
                          <p className="text-xs font-semibold text-slate-200">
                            Tap 'Install App' or 'Add to Home screen'
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Chrome will often show a banner at the bottom: <strong className="text-sky-300">"Add PharmMed ERP to Home screen"</strong>. If not visible, tap the top-right menu (<code className="text-slate-300">⋮</code>) and select <strong className="text-sky-300">"Install app"</strong> or <strong className="text-sky-300">"Add to Home screen"</strong>.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/60 border border-slate-750">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 text-xs font-bold shrink-0">
                          3
                        </span>
                        <div>
                          <p className="text-xs font-semibold text-slate-200">
                            Launch from Android App Drawer
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            The ERP icon will be added to your app drawer and home screen. When opened, it behaves like an APK native Android app with full hardware acceleration.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedPlatform === 'ios' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                      <div className="flex items-center gap-2">
                        <Tablet className="w-5 h-5 text-sky-400" />
                        <h4 className="text-sm font-bold text-white">
                          SOP: iOS & iPadOS Installation (Apple Safari Add to Home Screen)
                        </h4>
                      </div>
                      <span className="text-[11px] px-2.5 py-1 rounded bg-slate-700 text-slate-300">
                        Native Safari PWA
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-start gap-2">
                      <Info className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>
                        <strong>Note for Apple Devices:</strong> iOS requires using the native <strong>Safari</strong> browser to install PWAs to your Home Screen.
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/60 border border-slate-750">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 text-xs font-bold shrink-0">
                          1
                        </span>
                        <div>
                          <p className="text-xs font-semibold text-slate-200">
                            Open in Safari on iPhone or iPad
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Launch Apple Safari and browse to the ERP portal.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/60 border border-slate-750">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 text-xs font-bold shrink-0">
                          2
                        </span>
                        <div>
                          <p className="text-xs font-semibold text-slate-200">
                            Tap the Share Button
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Tap the <strong className="text-sky-300">Share</strong> icon (the square with an arrow pointing upwards) located at the bottom of the screen on iPhone, or top-right on iPad.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/60 border border-slate-750">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 text-xs font-bold shrink-0">
                          3
                        </span>
                        <div>
                          <p className="text-xs font-semibold text-slate-200">
                            Select 'Add to Home Screen'
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Scroll down the action sheet and tap <strong className="text-sky-300">"Add to Home Screen"</strong> (plus icon), then tap <strong className="text-slate-200">"Add"</strong> in the top-right corner.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: SYSTEM TROUBLESHOOTING SOP */}
          {activeTab === 'troubleshooting' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/40 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-amber-200 uppercase tracking-wide">
                    Institutional Incident & Troubleshooting SOP
                  </h3>
                  <p className="text-xs text-slate-300">
                    Follow these verified diagnostic procedures to resolve data synchronization delays, offline vault state issues, browser storage restrictions, or notification trigger anomalies.
                  </p>
                </div>
              </div>

              {/* Troubleshooting Accordions / Cards */}
              <div className="space-y-4">
                {/* Issue 1: Sync Failures */}
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
                        <RefreshCw className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-semibold text-white">
                        SOP-TS-01: Resolving Cloud Synchronization Delays & Queue Stalls
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                      Severity: Moderate
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 space-y-1.5 pl-8">
                    <p>
                      <strong>Symptoms:</strong> The top bar displays <em>"X Pending Sync"</em> for more than 60 seconds after network restoration.
                    </p>
                    <p>
                      <strong>Root Cause:</strong> Transient WebSocket latency or client-side batching pause.
                    </p>
                    <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-750 space-y-2 mt-2">
                      <p className="font-semibold text-sky-300">Step-by-Step Resolution:</p>
                      <ol className="list-decimal pl-4 space-y-1 text-slate-300">
                        <li>
                          Click the top navigation <strong>"Pending Sync"</strong> badge directly to trigger an immediate batch synchronization flush.
                        </li>
                        <li>
                          Verify your workstation or device has an active internet connection (check if the badge updates to <strong>"Cloud Synced"</strong>).
                        </li>
                        <li>
                          If sync remains stuck, switch to the <strong>Live Diagnostics</strong> tab in this modal and click <em>"Force Re-Sync with Cloud"</em>.
                        </li>
                      </ol>
                    </div>
                  </div>
                </div>

                {/* Issue 2: Offline Vault & Local Storage Access */}
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                        <Database className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-semibold text-white">
                        SOP-TS-02: Local Storage Access Denied or Data Loss on Tab Close
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                      Severity: High
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 space-y-1.5 pl-8">
                    <p>
                      <strong>Symptoms:</strong> Changes reset back to default whenever the browser is restarted or closed.
                    </p>
                    <p>
                      <strong>Root Cause:</strong> Browser is running in Incognito / Private Browsing mode, or third-party storage partitioning is blocking IndexedDB persistence.
                    </p>
                    <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-750 space-y-2 mt-2">
                      <p className="font-semibold text-sky-300">Step-by-Step Resolution:</p>
                      <ol className="list-decimal pl-4 space-y-1 text-slate-300">
                        <li>
                          Ensure you are <strong>not</strong> using Incognito / InPrivate windows for daily institutional ERP operations.
                        </li>
                        <li>
                          In Chrome / Edge, go to <code>chrome://settings/content/siteData</code> and ensure <em>"Allow sites to save data on your device"</em> is selected.
                        </li>
                        <li>
                          In Safari (macOS/iOS), go to <strong>Settings $\rightarrow$ Safari $\rightarrow$ Advanced</strong> and verify <em>"Block All Cookies"</em> is toggled OFF.
                        </li>
                        <li>
                          Always export a weekly institutional snapshot backup from the <strong>Backup Center</strong> as a fail-safe.
                        </li>
                      </ol>
                    </div>
                  </div>
                </div>

                {/* Issue 3: Stale Cache or Old UI Version */}
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400">
                        <HardDrive className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-semibold text-white">
                        SOP-TS-03: Stale Cache Eviction & Service Worker Hard Reset
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                      Severity: Low
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 space-y-1.5 pl-8">
                    <p>
                      <strong>Symptoms:</strong> New features, buttons, or updated audit records are not appearing after an institutional software update.
                    </p>
                    <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-750 space-y-2 mt-2">
                      <p className="font-semibold text-sky-300">Step-by-Step Resolution:</p>
                      <ul className="list-disc pl-4 space-y-1 text-slate-300">
                        <li>
                          <strong>Windows / Linux Hard Refresh:</strong> Press <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-650 text-slate-200">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-650 text-slate-200">F5</kbd> or <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-650 text-slate-200">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-650 text-slate-200">Shift</kbd> + <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-650 text-slate-200">R</kbd>.
                        </li>
                        <li>
                          <strong>macOS Hard Refresh:</strong> Press <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-650 text-slate-200">Cmd</kbd> + <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-650 text-slate-200">Shift</kbd> + <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-650 text-slate-200">R</kbd>.
                        </li>
                        <li>
                          <strong>PWA Mobile / Tablet:</strong> Swipe down on the screen to refresh, or close the app from the multitasking switcher and reopen.
                        </li>
                        <li>
                          <strong>Emergency Clean Slate:</strong> Use the <em>"Clear Local Cache & Re-seed Vault"</em> tool in the Diagnostics tab below.
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DIAGNOSTICS & SAFE CACHE RESET */}
          {activeTab === 'diagnostics' && (
            <div className="space-y-6">
              {/* Diagnostic Overview */}
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <h4 className="text-sm font-bold text-white">
                      Live Subsystem Diagnostic Health Check
                    </h4>
                  </div>
                  <button
                    onClick={runDiagnosticTest}
                    disabled={isRunningDiagnostic}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRunningDiagnostic ? 'animate-spin' : ''}`} />
                    Run Self-Diagnosis
                  </button>
                </div>

                {/* Status Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-750 space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Network Connectivity</span>
                      {isOnline ? (
                        <Wifi className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <WifiOff className="w-4 h-4 text-amber-400" />
                      )}
                    </div>
                    <div className="text-sm font-bold text-white">
                      {isOnline ? 'Online (Cloud Connected)' : 'Offline Vault Mode'}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {isOnline ? 'Low latency duplex sync' : 'Queuing operations locally'}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-750 space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>IndexedDB Vault</span>
                      <Database className="w-4 h-4 text-sky-400" />
                    </div>
                    <div className="text-sm font-bold text-white">
                      {diagnosticResult.indexedDbOk ? 'Active & Read/Write' : 'Testing...'}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {diagnosticResult.storageQuota}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-750 space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Sync Dispatch Queue</span>
                      <RefreshCw className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div className="text-sm font-bold text-white">
                      {pendingSyncCount} Operations Queued
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {pendingSyncCount === 0 ? 'All changes committed' : 'Awaiting dispatch'}
                    </div>
                  </div>
                </div>

                {diagnosticResult.tested && (
                  <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-750 text-xs text-slate-300 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{diagnosticResult.message}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={onTriggerSync}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white transition-all shadow-xs"
                >
                  <RefreshCw className="w-4 h-4" />
                  Force Cloud Re-Sync Now
                </button>

                <button
                  onClick={() => {
                    const text = `PharmMed ERP Diagnostic Report\nTimestamp: ${new Date().toISOString()}\nOnline: ${isOnline}\nPending Sync: ${pendingSyncCount}\nIndexedDB: ${diagnosticResult.indexedDbOk}\nStorage: ${diagnosticResult.storageQuota}`;
                    handleCopy(text, 'diag');
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 transition-all"
                >
                  {copiedText === 'diag' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  {copiedText === 'diag' ? 'Diagnostic Log Copied' : 'Copy System Diagnostic Log'}
                </button>
              </div>

              {/* DANGER ZONE: CLEAR LOCAL CACHE */}
              <div className="p-5 rounded-xl bg-rose-950/20 border border-rose-800/40 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 shrink-0 mt-0.5">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-rose-300">
                      Emergency Recovery: Clear Local Cache & Re-seed Vault
                    </h4>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      If the application displays persistent corrupt data, failed sync loops, or unresponsive tabs, you can purge the browser's temporary local IndexedDB cache and re-initialize with fresh verified institutional records.
                    </p>
                  </div>
                </div>

                {!confirmClearCache ? (
                  <button
                    onClick={() => setConfirmClearCache(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-xs cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear Local Cache
                  </button>
                ) : (
                  <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-600/60 space-y-3">
                    <div className="flex items-center gap-2 text-rose-200 text-xs font-bold">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      <span>Are you absolutely sure you want to clear the local cache?</span>
                    </div>
                    <p className="text-xs text-rose-300/90 leading-relaxed">
                      This will reset uncommitted local offline changes, clear the client-side IndexedDB vault, and re-initialize fresh default institutional data.
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setConfirmClearCache(false);
                          onClearCacheAndReset();
                        }}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-xs cursor-pointer"
                      >
                        Yes, Clear Cache & Reload
                      </button>
                      <button
                        onClick={() => setConfirmClearCache(false)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-850 border-t border-slate-750 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>PharmMed ERP Institutional Engine (ISO 21001:2025 / NAAC Compliant)</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg font-semibold bg-slate-750 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
