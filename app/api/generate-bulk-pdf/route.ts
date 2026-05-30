import { NextResponse } from 'next/server'
import { slipPdfFileName } from '@/lib/fileName'
import { renderSlipPdf } from '@/lib/pdfRender'
import type { AppSettings, SlipData } from '@/lib/types'
import { createZip } from '@/lib/zip'

interface GenerateBulkPdfBody {
  slips: SlipData[]
  settings: AppSettings
  tanggal_ttd?: string
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = (await request.json()) as GenerateBulkPdfBody

    if (!Array.isArray(body.slips) || body.slips.length === 0 || !body.settings) {
      return NextResponse.json({ success: false, error: 'Data slip dan settings wajib dikirim.' }, { status: 400 })
    }

    const usedFileNames = new Map<string, number>()
    const files: Array<{ name: string; data: ArrayBuffer }> = []

    for (const slip of body.slips) {
      const arrayBuffer = await renderSlipPdf(slip, body.settings, body.tanggal_ttd)
      files.push({ name: uniqueFileName(slipPdfFileName(slip), usedFileNames), data: arrayBuffer })
    }

    const zipBuffer = createZip(files)

    return new Response(zipBuffer.buffer as ArrayBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="SlipGaji_Semua.zip"',
      },
    })
  } catch {
    return NextResponse.json({ success: false, error: 'Gagal membuat ZIP semua slip.' }, { status: 500 })
  }
}

function uniqueFileName(fileName: string, usedFileNames: Map<string, number>): string {
  const count = usedFileNames.get(fileName) ?? 0
  usedFileNames.set(fileName, count + 1)

  if (count === 0) return fileName

  return fileName.replace(/\.pdf$/i, `_${count + 1}.pdf`)
}
