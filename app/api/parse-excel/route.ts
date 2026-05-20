import { NextResponse } from 'next/server'
import { parseExcelBuffer } from '@/lib/parseExcel'
import type { ParseExcelResponse } from '@/lib/types'

export async function POST(request: Request): Promise<NextResponse<ParseExcelResponse>> {
  try {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, error: 'File Excel wajib diupload.' }, { status: 400 })
    }

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      return NextResponse.json(
        { success: false, error: 'Format file tidak didukung. Gunakan file .xlsx' },
        { status: 400 },
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const data = parseExcelBuffer(buffer)

    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Gagal membaca file Excel.' },
      { status: 400 },
    )
  }
}
