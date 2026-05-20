import { Eye } from 'lucide-react'
import { calculateSlip } from '@/lib/calculateSlip'
import { formatRupiah } from '@/lib/formatRupiah'
import type { SlipData } from '@/lib/types'

interface EmployeeListProps {
  data: SlipData[]
  onPreview: (index: number) => void
}

export function EmployeeList({ data, onPreview }: EmployeeListProps) {
  if (data.length === 0) return null

  return (
    <section className="card no-print">
      <div className="card__body">
        <h2 className="card__title">Data Karyawan ({data.length} orang)</h2>
        <p className="card__description">Klik lihat untuk membuka preview slip A5.</p>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Nama</th>
              <th>Periode</th>
              <th>Total</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.map((slip, index) => (
              <tr key={`${slip.no}-${slip.nama}`}>
                <td>{slip.no}</td>
                <td>{slip.nama}</td>
                <td>{slip.periode}</td>
                <td>{formatRupiah(calculateSlip(slip).total_penerimaan)}</td>
                <td>
                  <button className="button" type="button" onClick={() => onPreview(index)} aria-label={`Lihat slip ${slip.nama}`}>
                    <Eye size={16} /> Lihat
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
