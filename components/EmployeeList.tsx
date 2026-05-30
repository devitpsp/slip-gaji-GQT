import { Eye } from 'lucide-react'
import { useState } from 'react'
import { calculateSlip } from '@/lib/calculateSlip'
import { formatRupiah } from '@/lib/formatRupiah'
import { DEFAULT_SETTINGS } from '@/lib/settings'
import type { AppSettings, SlipData } from '@/lib/types'

interface EmployeeListProps {
  data: SlipData[]
  settings: AppSettings | null
  tanggalTtd: string
  onPreview: (index: number) => void
  onError: (message: string) => void
}

export function EmployeeList({ data, settings, tanggalTtd, onPreview, onError }: EmployeeListProps) {
  const [sharingIndex, setSharingIndex] = useState<number | null>(null)

  if (data.length === 0) return null

  return (
    <section className="card no-print">
      <div className="card__body table-toolbar">
        <div>
          <h2 className="card__title">Data Karyawan</h2>
          <p className="card__description">Klik lihat untuk membuka preview slip A5.</p>
        </div>
        <span className="count-badge">{data.length} orang</span>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th scope="col">No</th>
              <th scope="col">Nama</th>
              <th scope="col">No HP</th>
              <th scope="col">Periode</th>
              <th scope="col">Total</th>
              <th scope="col">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.map((slip, index) => {
              const hasWhatsappPhone = Boolean(normalizeWhatsAppPhone(slip.phone_number))
              const isSharing = sharingIndex === index

              return (
                <tr key={`${slip.no}-${slip.nama}`}>
                  <td>{slip.no}</td>
                  <td>{slip.nama}</td>
                  <td>{slip.phone_number || '-'}</td>
                  <td>{slip.periode}</td>
                  <td className="table-number">{formatRupiah(calculateSlip(slip).total_penerimaan)}</td>
                  <td className="table-action">
                    <div className="actions">
                      <button className="button" type="button" onClick={() => onPreview(index)} aria-label={`Lihat slip ${slip.nama}`}>
                        <Eye size={16} /> Lihat
                      </button>
                      <button
                        className="button"
                        type="button"
                        disabled={!settings || !hasWhatsappPhone || isSharing}
                        onClick={() => shareToWhatsApp({ slip, index, settings, tanggalTtd, setSharingIndex, onError })}
                        aria-label={`Kirim WhatsApp ke ${slip.nama}`}
                      >
                        <img className="button__icon" src="/whatsapp.svg" alt="" aria-hidden="true" /> {isSharing ? 'Membuat Link...' : 'WhatsApp'}
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

async function shareToWhatsApp({ slip, index, settings, tanggalTtd, setSharingIndex, onError }: { slip: SlipData; index: number; settings: AppSettings | null; tanggalTtd: string; setSharingIndex: (index: number | null) => void; onError: (message: string) => void }) {
  const phone = normalizeWhatsAppPhone(slip.phone_number)
  if (!phone || !settings) return

  setSharingIndex(index)
  onError('')

  try {
    const response = await fetch('/api/share-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slip, settings, tanggal_ttd: tanggalTtd }),
    })
    const result = (await response.json()) as SharePdfResponse

    if (!result.success) {
      onError(result.error)
      return
    }

    const message = renderWhatsAppMessage(slip, settings, result.url)
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
  } catch {
    onError('Gagal membuat link PDF WhatsApp.')
  } finally {
    setSharingIndex(null)
  }
}

function normalizeWhatsAppPhone(value: string): string | null {
  const digits = value.replace(/\D/g, '')
  if (digits.length < 9) return null
  if (digits.startsWith('0')) return `62${digits.slice(1)}`
  if (digits.startsWith('62')) return digits
  if (digits.startsWith('8')) return `62${digits}`
  return null
}

function renderWhatsAppMessage(slip: SlipData, settings: AppSettings, pdfUrl: string): string {
  const calculated = calculateSlip(slip)
  const template = settings.whatsapp_message.trim() || DEFAULT_SETTINGS.whatsapp_message
  const message = template
    .replaceAll('{nama}', slip.nama)
    .replaceAll('{periode}', slip.periode)
    .replaceAll('{periode_lengkap}', slip.periode_lengkap)
    .replaceAll('{institusi}', settings.nama_institusi || DEFAULT_SETTINGS.nama_institusi)
    .replaceAll('{total}', formatRupiah(calculated.total_penerimaan))
    .replaceAll('{pdf_url}', pdfUrl)

  return template.includes('{pdf_url}') ? message : `${message}\n\nLink PDF: ${pdfUrl}`
}

type SharePdfResponse =
  | { success: true; url: string; expires_in_days: number }
  | { success: false; error: string }
