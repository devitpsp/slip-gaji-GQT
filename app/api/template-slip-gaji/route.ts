import * as XLSX from 'xlsx'

const HEADERS = [
  'nama',
  'phone_number',
  'periode',
  'periode_lengkap',
  'transport_per_datang',
  'jumlah_hadir',
  'tunjangan',
  'thr',
  'potongan',
]

const EXAMPLE_ROW = ['Ahmad', '081234567890', 'Mei 2026', '1-31 Mei 2026', 25000, 20, 500000, 0, 0]

export async function GET(): Promise<Response> {
  const worksheet = XLSX.utils.aoa_to_sheet([HEADERS, EXAMPLE_ROW])
  worksheet['!cols'] = [
    { wch: 24 },
    { wch: 18 },
    { wch: 16 },
    { wch: 24 },
    { wch: 22 },
    { wch: 14 },
    { wch: 14 },
    { wch: 12 },
    { wch: 14 },
  ]
  const phoneCell = worksheet.B2
  if (phoneCell) phoneCell.z = '@'

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Slip Gaji')
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }) as Buffer

  return new Response(buffer.buffer as ArrayBuffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="template-slip-gaji.xlsx"',
    },
  })
}
