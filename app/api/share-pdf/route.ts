import { NextResponse } from 'next/server'
import { slipPdfFileName } from '@/lib/fileName'
import { renderSlipPdf } from '@/lib/pdfRender'
import { saveSharedPdf, SHARE_EXPIRY_DAYS } from '@/lib/pdfStorage'
import type { AppSettings, SlipData } from '@/lib/types'

interface SharePdfBody {
  slip: SlipData
  settings: AppSettings
  tanggal_ttd?: string
}

export async function POST(request: Request): Promise<NextResponse<{ success: true; url: string; expires_in_days: number } | { success: false; error: string }>> {
  try {
    const body = (await request.json()) as SharePdfBody

    if (!body.slip || !body.settings) {
      return NextResponse.json({ success: false, error: 'Data slip dan settings wajib dikirim.' }, { status: 400 })
    }

    const pdf = await renderSlipPdf(body.slip, body.settings, body.tanggal_ttd)
    const meta = await saveSharedPdf(pdf, slipPdfFileName(body.slip))
    const origin = new URL(request.url).origin

    return NextResponse.json({
      success: true,
      url: `${origin}/pdf/${meta.id}`,
      expires_in_days: SHARE_EXPIRY_DAYS,
    })
  } catch {
    return NextResponse.json({ success: false, error: 'Gagal membuat link PDF.' }, { status: 500 })
  }
}
