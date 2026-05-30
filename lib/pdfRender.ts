import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { pdf } from '@react-pdf/renderer'
import { SlipPdfDocument } from '@/components/SlipPdfDocument'
import type { AppSettings, SlipData } from '@/lib/types'

export async function renderSlipPdf(slip: SlipData, settings: AppSettings, tanggalTtd?: string): Promise<ArrayBuffer> {
  const document = SlipPdfDocument({
    data: slip,
    settings: await withDefaultLogo(settings),
    tanggalTtd,
  })
  const blob = await pdf(document).toBlob()
  return blob.arrayBuffer()
}

export async function withDefaultLogo(settings: AppSettings): Promise<AppSettings> {
  if (settings.logo_data_url) return settings

  const logo = await readFile(join(process.cwd(), 'public', 'GQT-icon.png'))
  return { ...settings, logo_data_url: `data:image/png;base64,${logo.toString('base64')}` }
}
