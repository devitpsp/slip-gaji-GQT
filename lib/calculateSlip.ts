import type { CalculatedSlip, SlipData } from './types'

export function calculateSlip(data: SlipData): CalculatedSlip {
  const subtotal_transport = data.transport_per_datang * data.jumlah_hadir
  const total_penerimaan = subtotal_transport + data.tunjangan + data.thr - data.potongan

  return {
    ...data,
    subtotal_transport,
    total_penerimaan,
  }
}
