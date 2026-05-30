import { NextResponse } from 'next/server'
import { slipPdfFileName } from '@/lib/fileName'
import { renderSlipPdf } from '@/lib/pdfRender'
import type { AppSettings, SlipData } from '@/lib/types'

interface GeneratePdfBody {
  slip: SlipData
  settings: AppSettings
  tanggal_ttd?: string
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = (await request.json()) as GeneratePdfBody

    if (!body.slip || !body.settings) {
      return NextResponse.json({ success: false, error: 'Data slip dan settings wajib dikirim.' }, { status: 400 })
    }

    const arrayBuffer = await renderSlipPdf(body.slip, body.settings, body.tanggal_ttd)

    return new Response(arrayBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${slipPdfFileName(body.slip)}"`,
      },
    })
  } catch {
    return NextResponse.json({ success: false, error: 'Gagal membuat PDF.' }, { status: 500 })
  }
}
