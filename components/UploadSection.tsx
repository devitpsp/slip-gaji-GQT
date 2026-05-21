import { Download, Upload } from 'lucide-react'
import type { ChangeEvent, DragEvent } from 'react'

interface UploadSectionProps {
  isLoading: boolean
  error: string | null
  onFile: (file: File) => void
}

export function UploadSection({ isLoading, error, onFile }: UploadSectionProps) {
  function handleInput(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) onFile(file)
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file) onFile(file)
  }

  return (
    <section className="card no-print">
      <div className="card__body stack">
        <div>
          <h2 className="card__title">Upload Excel</h2>
          <p className="card__description">Gunakan file .xlsx atau .xls dengan 8 kolom wajib sesuai template.</p>
        </div>

        <label className="upload-zone" onDragOver={(event) => event.preventDefault()} onDrop={handleDrop}>
          <Upload size={28} />
          <div style={{ marginTop: 10, fontWeight: 700 }}>{isLoading ? 'Membaca file...' : 'Klik untuk upload file Excel'}</div>
          <div style={{ marginTop: 4, color: 'var(--color-text-secondary)' }}>atau drag & drop file di sini</div>
          <input type="file" accept=".xlsx,.xls" onChange={handleInput} disabled={isLoading} hidden />
        </label>

        {error ? <div className="alert alert--error">{error}</div> : null}

        <div className="actions">
          <a className="button" href="/template-slip-gaji.xlsx" download>
            <Download size={16} /> Download Template Slip Gaji
          </a>
        </div>
      </div>
    </section>
  )
}
