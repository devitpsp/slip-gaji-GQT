import * as XLSX from 'xlsx'
import type { SlipData } from './types'

const REQUIRED_HEADERS = [
  'nama',
  'phone_number',
  'periode',
  'periode_lengkap',
  'transport_per_datang',
  'jumlah_hadir',
  'tunjangan',
  'thr',
  'potongan',
] as const

const NUMERIC_FIELDS = [
  'transport_per_datang',
  'jumlah_hadir',
  'tunjangan',
  'thr',
  'potongan',
] as const

type RequiredHeader = (typeof REQUIRED_HEADERS)[number]

export function parseExcelBuffer(buffer: Buffer): SlipData[] {
  const workbook = XLSX.read(buffer, { type: 'buffer' })
  const sheetName = workbook.SheetNames[0]

  if (!sheetName) {
    throw new Error('File Excel tidak memiliki data. Pastikan data dimulai dari baris ke-2.')
  }

  const sheet = workbook.Sheets[sheetName]
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: '',
    raw: true,
  })

  if (rows.length === 0) {
    throw new Error('File Excel tidak memiliki data. Pastikan data dimulai dari baris ke-2.')
  }

  const headers = Object.keys(rows[0]).map((header) => header.trim())

  for (const requiredHeader of REQUIRED_HEADERS) {
    if (!headers.includes(requiredHeader)) {
      throw new Error(`Kolom '${requiredHeader}' tidak ditemukan. Download template untuk melihat format yang benar.`)
    }
  }

  return rows.map((row, index) => {
    const normalized = normalizeRow(row)

    return {
      no: index + 1,
      nama: stringValue(normalized.nama),
      phone_number: stringValue(normalized.phone_number),
      periode: stringValue(normalized.periode),
      periode_lengkap: stringValue(normalized.periode_lengkap),
      transport_per_datang: numberValue(normalized.transport_per_datang, 'transport_per_datang', index),
      jumlah_hadir: numberValue(normalized.jumlah_hadir, 'jumlah_hadir', index),
      tunjangan: numberValue(normalized.tunjangan, 'tunjangan', index),
      thr: numberValue(normalized.thr, 'thr', index),
      potongan: numberValue(normalized.potongan, 'potongan', index),
    }
  })
}

function normalizeRow(row: Record<string, unknown>): Record<RequiredHeader, unknown> {
  const entries = Object.entries(row).map(([key, value]) => [key.trim(), value])
  const normalized = Object.fromEntries(entries) as Record<RequiredHeader, unknown>
  return normalized
}

function stringValue(value: unknown): string {
  return String(value ?? '').trim()
}

function numberValue(value: unknown, field: (typeof NUMERIC_FIELDS)[number], rowIndex: number): number {
  const numericValue = typeof value === 'number' ? value : Number(String(value).trim())

  if (!Number.isFinite(numericValue)) {
    throw new Error(`Nilai '${field}' di baris ${rowIndex + 2} harus berupa angka bulat tanpa titik/koma.`)
  }

  return Math.trunc(numericValue)
}
