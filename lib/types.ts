export interface SlipData {
  no: number
  nama: string
  phone_number: string
  periode: string
  periode_lengkap: string
  transport_per_datang: number
  jumlah_hadir: number
  tunjangan: number
  thr: number
  potongan: number
}

export interface CalculatedSlip extends SlipData {
  subtotal_transport: number
  total_penerimaan: number
}

export interface AppSettings {
  nama_institusi: string
  kota_ttd: string
  nama_bendahara: string
  jabatan_bendahara: string
  kampus: string
  whatsapp_message: string
  logo_data_url?: string
}

export type ParseExcelResponse =
  | { success: true; data: SlipData[] }
  | { success: false; error: string }
