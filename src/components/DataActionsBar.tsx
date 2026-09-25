import React, { useState, useRef } from 'react';
import { Download, Upload, FileText, ChevronDown, Check, AlertCircle } from 'lucide-react';
import { ExportFormat, exportData, ExportColumn } from '../utils/exportEngine';

interface DataActionsBarProps<T extends Record<string, any>> {
  title: string;
  data: T[];
  columns: ExportColumn<T>[];
  filename: string;
  onImportData?: (imported: T[]) => void;
  onAddNew?: () => void;
  addLabel?: string;
  isAdminOrAuthorized?: boolean;
}

export function DataActionsBar<T extends Record<string, any>>({
  title,
  data,
  columns,
  filename,
  onImportData,
  onAddNew,
  addLabel = 'Add Record',
  isAdminOrAuthorized = true,
}: DataActionsBarProps<T>) {
  const [isOpenMenu, setIsOpenMenu] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleExport = (fmt: ExportFormat) => {
    exportData(data, filename, title, columns, fmt);
    setIsOpenMenu(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        let parsed: any[] = [];
        if (file.name.endsWith('.json')) {
          parsed = JSON.parse(text);
        } else if (file.name.endsWith('.csv')) {
          // Parse CSV
          const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
          if (lines.length > 1) {
            const rawHeaders = lines[0].split(',').map((h) => h.replace(/^"|"$/g, '').trim());
            parsed = lines.slice(1).map((line, idx) => {
              const values = line.split(',').map((v) => v.replace(/^"|"$/g, '').trim());
              const obj: any = { id: `imp-${Date.now()}-${idx}` };
              rawHeaders.forEach((h, hIdx) => {
                obj[h] = values[hIdx] || '';
              });
              return obj;
            });
          }
        } else {
          setImportStatus('Please upload a .json or .csv data file.');
          return;
        }

        if (Array.isArray(parsed) && parsed.length > 0 && onImportData) {
          onImportData(parsed);
          setImportStatus(`Successfully imported ${parsed.length} records!`);
          setTimeout(() => setImportStatus(null), 4000);
        } else {
          setImportStatus('No valid record list found in file.');
        }
      } catch (err: any) {
        setImportStatus(`Import Error: ${err.message || 'Invalid format'}`);
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-slate-300">
          Showing <span className="text-sky-400 font-bold">{data.length}</span> Records
        </span>
        {importStatus && (
          <span className="text-[11px] px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 flex items-center gap-1">
            <Check className="w-3 h-3 text-emerald-400" /> {importStatus}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json,.csv"
          className="hidden"
        />

        {/* Import Button */}
        {isAdminOrAuthorized && onImportData && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700 transition cursor-pointer"
            title="Import from JSON or CSV"
          >
            <Upload className="w-3.5 h-3.5 text-sky-400" />
            <span>Import</span>
          </button>
        )}

        {/* Export Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsOpenMenu(!isOpenMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export As</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isOpenMenu && (
            <div className="absolute right-0 mt-1 w-44 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1 z-50 text-xs">
              <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Multi-Format Export
              </div>
              <button
                onClick={() => handleExport('EXCEL')}
                className="w-full text-left px-3 py-1.5 text-slate-200 hover:bg-slate-800 flex items-center justify-between cursor-pointer"
              >
                <span>Excel Spreadsheet (.csv)</span>
                <span className="text-[10px] text-emerald-400 font-mono">XLSX/CSV</span>
              </button>
              <button
                onClick={() => handleExport('PDF')}
                className="w-full text-left px-3 py-1.5 text-slate-200 hover:bg-slate-800 flex items-center justify-between cursor-pointer"
              >
                <span>Printable PDF Doc</span>
                <span className="text-[10px] text-rose-400 font-mono">PDF</span>
              </button>
              <button
                onClick={() => handleExport('DOC')}
                className="w-full text-left px-3 py-1.5 text-slate-200 hover:bg-slate-800 flex items-center justify-between cursor-pointer"
              >
                <span>Word Document (.doc)</span>
                <span className="text-[10px] text-sky-400 font-mono">DOC</span>
              </button>
              <button
                onClick={() => handleExport('PPT')}
                className="w-full text-left px-3 py-1.5 text-slate-200 hover:bg-slate-800 flex items-center justify-between cursor-pointer"
              >
                <span>Presentation Slide Deck</span>
                <span className="text-[10px] text-amber-400 font-mono">PPT</span>
              </button>
              <button
                onClick={() => handleExport('XML')}
                className="w-full text-left px-3 py-1.5 text-slate-200 hover:bg-slate-800 flex items-center justify-between cursor-pointer"
              >
                <span>Structured XML</span>
                <span className="text-[10px] text-violet-400 font-mono">XML</span>
              </button>
              <button
                onClick={() => handleExport('JSON')}
                className="w-full text-left px-3 py-1.5 text-slate-200 hover:bg-slate-800 flex items-center justify-between cursor-pointer"
              >
                <span>Raw JSON Data</span>
                <span className="text-[10px] text-slate-400 font-mono">JSON</span>
              </button>
            </div>
          )}
        </div>

        {/* Add New Record Button */}
        {isAdminOrAuthorized && onAddNew && (
          <button
            onClick={onAddNew}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white transition cursor-pointer shadow-sm shadow-sky-600/30"
          >
            <span>+</span>
            <span>{addLabel}</span>
          </button>
        )}
      </div>
    </div>
  );
}
