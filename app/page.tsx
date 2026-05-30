'use client'

import Link from 'next/link'
import { Download, Printer } from 'lucide-react'
import { useEffect, useState } from 'react'
import { EmployeeList } from '@/components/EmployeeList'
import { PageHeader } from '@/components/PageHeader'
import { SlipPreview } from '@/components/SlipPreview'
import { SlipPreviewModal } from '@/components/SlipPreviewModal'
import { UploadSection } from '@/components/UploadSection'
import { slipPdfFileName } from '@/lib/fileName'
import { getTanggalTtd, isSettingsComplete } from '@/lib/settings'
import type { AppSettings, ParseExcelResponse, SlipData } from '@/lib/types'

export default function HomePage() {
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [data, setData] = useState<SlipData[]>([])
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const settingsComplete = isSettingsComplete(settings)

  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetch('/api/settings')
        if (!response.ok) return
        setSettings((await response.json()) as AppSettings)
      } catch {
        setError('Gagal memuat pengaturan institusi.')
      }
    }

    loadSettings()
  }, [])

  async function handleFile(file: File) {
    setIsLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await fetch('/api/parse-excel', { method: 'POST', body: formData })
      const result = (await response.json()) as ParseExcelResponse

      if (!result.success) {
        setError(result.error)
        return
      }

      setData(result.data)
      setSelectedIndex(null)
    } catch {
      setError('Gagal upload file Excel. Coba ulangi.')
    } finally {
      setIsLoading(false)
    }
  }

  async function downloadPdf(slip: SlipData): Promise<Blob | null> {
    if (!settingsComplete || !settings) {
      setError('Pengaturan institusi belum diisi. Lengkapi di menu Settings sebelum membuat slip.')
      return null
    }

    const response = await fetch('/api/generate-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slip, settings, tanggal_ttd: getTanggalTtd() }),
    })

    if (!response.ok) {
      setError('Gagal membuat PDF.')
      return null
    }

    return response.blob()
  }

  async function handleDownloadPdf(slip: SlipData) {
    const blob = await downloadPdf(slip)
    if (!blob) return

    downloadBlob(blob, slipPdfFileName(slip))
  }

  function handlePrintAll() {
    if (data.length === 0) return

    if (!settingsComplete || !settings) {
      setError('Pengaturan institusi belum diisi. Lengkapi di menu Settings sebelum membuat slip.')
      return
    }

    window.print()
  }

  async function handleDownloadAllPdf() {
    if (data.length === 0) return

    if (!settingsComplete || !settings) {
      setError('Pengaturan institusi belum diisi. Lengkapi di menu Settings sebelum membuat slip.')
      return
    }

    setIsDownloading(true)
    setError(null)

    try {
      const response = await fetch('/api/generate-bulk-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slips: data, settings, tanggal_ttd: getTanggalTtd() }),
      })

      if (!response.ok) {
        setError('Gagal membuat ZIP semua slip.')
        return
      }

      const blob = await response.blob()
      downloadBlob(blob, 'SlipGaji_Semua.zip')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="stack">
      <PageHeader
        title="Slip Gaji Generator"
        description="Upload Excel, preview slip A5, lalu print atau download PDF."
        actions={
          data.length > 0 ? (
            <div className="actions">
              <button className="button" type="button" onClick={handlePrintAll} disabled={!settingsComplete}>
                <Printer size={16} /> Print Semua
              </button>
              <button className="button button--primary" type="button" onClick={handleDownloadAllPdf} disabled={isDownloading || !settingsComplete}>
                <Download size={16} /> {isDownloading ? 'Membuat ZIP...' : 'Download Semua PDF (.zip)'}
              </button>
            </div>
          ) : null
        }
      />

      <div className="workflow no-print" aria-label="Status alur kerja">
        <div className={`workflow__step ${settingsComplete ? 'workflow__step--done' : 'workflow__step--active'}`}>
          <strong>1. Settings</strong>
          <span>{settingsComplete ? 'Pengaturan siap dipakai.' : 'Lengkapi data institusi dulu.'}</span>
        </div>
        <div className={`workflow__step ${data.length > 0 ? 'workflow__step--done' : settingsComplete ? 'workflow__step--active' : ''}`}>
          <strong>2. Upload Excel</strong>
          <span>{data.length > 0 ? `${data.length} karyawan terbaca.` : 'Upload file sesuai template.'}</span>
        </div>
        <div className={`workflow__step ${selectedIndex !== null ? 'workflow__step--done' : data.length > 0 ? 'workflow__step--active' : ''}`}>
          <strong>3. Review</strong>
          <span>{data.length > 0 ? 'Cek data dan preview slip.' : 'Menunggu data karyawan.'}</span>
        </div>
        <div className={`workflow__step ${data.length > 0 && settingsComplete ? 'workflow__step--active' : ''}`}>
          <strong>4. Export</strong>
          <span>{data.length > 0 && settingsComplete ? 'Print, PDF, ZIP, dan WhatsApp siap.' : 'Siap setelah data valid.'}</span>
        </div>
      </div>

      {!settingsComplete ? (
        <div className="alert alert--warning no-print">
          Pengaturan institusi belum diisi. Lengkapi di menu <Link href="/settings"><strong>Settings</strong></Link> sebelum membuat slip.
        </div>
      ) : null}

      <UploadSection isLoading={isLoading} error={error} onFile={handleFile} />
      <EmployeeList data={data} settings={settings} tanggalTtd={getTanggalTtd()} onPreview={setSelectedIndex} onError={setError} />

      {selectedIndex !== null && settingsComplete && settings ? (
        <SlipPreviewModal data={data} selectedIndex={selectedIndex} settings={settings} onClose={() => setSelectedIndex(null)} onSelect={setSelectedIndex} onDownloadPdf={handleDownloadPdf} />
      ) : null}

      {data.length > 0 && settingsComplete && settings ? (
        <div className="print-all-area">
          {data.map((slip) => <SlipPreview key={`${slip.no}-${slip.nama}`} data={slip} settings={settings} />)}
        </div>
      ) : null}
    </div>
  )
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}
