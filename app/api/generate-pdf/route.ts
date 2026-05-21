import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { pdf } from '@react-pdf/renderer'
import { NextResponse } from 'next/server'
import { SlipPdfDocument } from '@/components/SlipPdfDocument'
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

    const document = SlipPdfDocument({
      data: body.slip,
      settings: await withDefaultLogo(body.settings),
      tanggalTtd: body.tanggal_ttd,
    })
    const blob = await pdf(document).toBlob()
    const arrayBuffer = await blob.arrayBuffer()

    return new Response(arrayBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="SlipGaji_${safeFileName(body.slip.nama)}_${safeFileName(body.slip.periode)}.pdf"`,
      },
    })
  } catch {
    return NextResponse.json({ success: false, error: 'Gagal membuat PDF.' }, { status: 500 })
  }
}

async function withDefaultLogo(settings: AppSettings): Promise<AppSettings> {
  if (settings.logo_data_url) return settings

  const logo = await readFile(join(process.cwd(), 'public', 'GQT-icon.png'))
  return { ...settings, logo_data_url: `data:image/png;base64,${logo.toString('base64')}` }
}

function safeFileName(value: string): string {
  return value.replace(/[^a-z0-9-_]+/gi, '_')
}
