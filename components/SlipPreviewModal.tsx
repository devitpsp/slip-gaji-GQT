'use client'

import { ChevronLeft, ChevronRight, Download, Printer, X } from 'lucide-react'
import { useEffect } from 'react'
import { SlipPreview } from '@/components/SlipPreview'
import type { AppSettings, SlipData } from '@/lib/types'

interface SlipPreviewModalProps {
  data: SlipData[]
  selectedIndex: number
  settings: AppSettings
  onClose: () => void
  onSelect: (index: number) => void
  onDownloadPdf: (slip: SlipData) => void
}

export function SlipPreviewModal({ data, selectedIndex, settings, onClose, onSelect, onDownloadPdf }: SlipPreviewModalProps) {
  const slip = data[selectedIndex]
  const canPrev = selectedIndex > 0
  const canNext = selectedIndex < data.length - 1

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  if (!slip) return null

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-panel">
        <div className="modal-header no-print">
          <div className="actions">
            <button className="button" type="button" disabled={!canPrev} onClick={() => onSelect(selectedIndex - 1)}>
              <ChevronLeft size={16} /> Prev
            </button>
            <button className="button" type="button" disabled={!canNext} onClick={() => onSelect(selectedIndex + 1)}>
              Next <ChevronRight size={16} />
            </button>
          </div>
          <strong>{slip.nama} - {selectedIndex + 1}/{data.length}</strong>
          <button className="button button--ghost" type="button" onClick={onClose} aria-label="Tutup preview">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div className="slip-print-area">
            <SlipPreview data={slip} settings={settings} />
          </div>
          <div className="actions no-print">
            <button className="button" type="button" onClick={() => window.print()}>
              <Printer size={16} /> Print Ini
            </button>
            <button className="button button--primary" type="button" onClick={() => onDownloadPdf(slip)}>
              <Download size={16} /> Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
