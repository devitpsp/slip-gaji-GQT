import { calculateSlip } from '@/lib/calculateSlip'
import { formatNumber, formatRupiah } from '@/lib/formatRupiah'
import { getTanggalTtd } from '@/lib/settings'
import type { AppSettings, SlipData } from '@/lib/types'

interface SlipPreviewProps {
  data: SlipData
  settings: AppSettings
  tanggalTtd?: string
}

export function SlipPreview({ data, settings, tanggalTtd }: SlipPreviewProps) {
  const calculated = calculateSlip(data)

  return (
    <article className="slip-paper">
      <div className="slip-title">SLIP GAJI {settings.nama_institusi}</div>
      <div className="slip-subtitle">Periode: {data.periode_lengkap}</div>

      <section className="slip-section">
        <div className="slip-grid">
          <div className="slip-info">
            <div>No&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: {data.no}</div>
            <div>Nama&nbsp;&nbsp;&nbsp;&nbsp;: {data.nama}</div>
            <div>Kampus&nbsp;&nbsp;: {settings.kampus}</div>
            <div>Periode : {data.periode}</div>
          </div>
          <div className="slip-logo">
            {settings.logo_data_url ? <img src={settings.logo_data_url} alt="Logo institusi" /> : <span>LOGO</span>}
          </div>
        </div>
      </section>

      <section className="slip-section">
        <div className="slip-row slip-row--center">Rincian</div>
        <div className="slip-row"><span>Transport per datang</span><strong>{formatRupiah(data.transport_per_datang)}</strong></div>
        <div className="slip-row"><span>Jumlah Hadir</span><strong>{formatNumber(data.jumlah_hadir)}</strong></div>
        <div className="slip-row"><span>Subtotal Transport</span><strong>{formatRupiah(calculated.subtotal_transport)}</strong></div>
        <div className="slip-row"><span>Tunjangan</span><strong>{formatRupiah(data.tunjangan)}</strong></div>
        <div className="slip-row"><span>THR</span><strong>{formatRupiah(data.thr)}</strong></div>
        <div className="slip-row"><span>Potongan</span><strong>{formatRupiah(data.potongan)}</strong></div>
        <div className="slip-row slip-row--total"><span>Total Penerimaan</span><strong>{formatRupiah(calculated.total_penerimaan)}</strong></div>
      </section>

      <section className="slip-section slip-signature">
        <div>
          <div>Mengetahui,</div>
          <div>{settings.kota_ttd}, {tanggalTtd ?? getTanggalTtd()}</div>
        </div>
        <div>
          <strong>{settings.nama_bendahara}</strong>
          <div>{settings.jabatan_bendahara}</div>
        </div>
      </section>
    </article>
  )
}
