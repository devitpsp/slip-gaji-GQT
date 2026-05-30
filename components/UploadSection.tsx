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
          <p className="card__description">Gunakan file .xlsx atau .xls dengan 9 kolom wajib sesuai template.</p>
        </div>

        <label className="upload-zone" onDragOver={(event) => event.preventDefault()} onDrop={handleDrop}>
          <span className="upload-zone__icon">
            <Upload size={22} />
          </span>
          <span className="upload-zone__title">{isLoading ? 'Membaca file...' : 'Klik untuk upload file Excel'}</span>
          <span className="upload-zone__hint">atau drag & drop file di sini</span>
          <span className="upload-zone__meta">Format: .xlsx atau .xls</span>
          <input type="file" accept=".xlsx,.xls" onChange={handleInput} disabled={isLoading} hidden />
        </label>

        {error ? <div className="alert alert--error">{error}</div> : null}

        <div className="actions">
          <a className="button" href="/api/template-slip-gaji" download>
            <Download size={16} /> Download Template Slip Gaji
          </a>
        </div>
      </div>
    </section>
  )
}
