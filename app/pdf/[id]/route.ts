import { NextResponse } from 'next/server'
import { getSharedPdf } from '@/lib/pdfStorage'

interface PdfRouteContext {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, context: PdfRouteContext): Promise<Response> {
  const { id } = await context.params
  const record = await getSharedPdf(id)

  if (!record) {
    return NextResponse.json({ success: false, error: 'Link PDF tidak ditemukan atau sudah expired.' }, { status: 404 })
  }

  return new Response(record.pdf.buffer as ArrayBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${record.meta.fileName}"`,
      'Cache-Control': 'private, no-store',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  })
}
