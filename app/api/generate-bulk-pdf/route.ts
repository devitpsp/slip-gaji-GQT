import { randomUUID } from 'node:crypto'
import { rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { pdf } from '@react-pdf/renderer'
import { NextResponse } from 'next/server'
import { SlipPdfDocument } from '@/components/SlipPdfDocument'
import type { AppSettings, SlipData } from '@/lib/types'

interface GenerateBulkPdfBody {
  slips: SlipData[]
  settings: AppSettings
  tanggal_ttd?: string
}

export async function POST(request: Request): Promise<Response> {
  let logoPath: string | undefined

  try {
    const body = (await request.json()) as GenerateBulkPdfBody

    if (!Array.isArray(body.slips) || body.slips.length === 0 || !body.settings) {
      return NextResponse.json({ success: false, error: 'Data slip dan settings wajib dikirim.' }, { status: 400 })
    }

    logoPath = await writeLogoTempFile(body.settings.logo_data_url)
    const document = SlipPdfDocument({
      data: body.slips,
      settings: body.settings,
      tanggalTtd: body.tanggal_ttd,
      logoSource: logoPath,
    })
    const blob = await pdf(document).toBlob()
    const arrayBuffer = await blob.arrayBuffer()

    return new Response(arrayBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="SlipGaji_Semua.pdf"',
      },
    })
  } catch {
    return NextResponse.json({ success: false, error: 'Gagal membuat PDF semua slip.' }, { status: 500 })
  } finally {
    if (logoPath) await rm(logoPath, { force: true })
  }
}

async function writeLogoTempFile(dataUrl: string | undefined): Promise<string | undefined> {
  if (!dataUrl) return undefined

  const match = dataUrl.match(/^data:image\/(png|jpeg|jpg);base64,(.+)$/)
  if (!match) return undefined

  const extension = match[1] === 'png' ? 'png' : 'jpg'
  const filePath = join(tmpdir(), `slip-gaji-logo-${randomUUID()}.${extension}`)
  await writeFile(filePath, Buffer.from(match[2], 'base64'))
  return filePath
}
