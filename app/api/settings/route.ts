import { NextResponse } from 'next/server'
import { getServerSettings, saveServerSettings } from '@/lib/serverSettings'
import { normalizeSettings } from '@/lib/settings'
import type { AppSettings } from '@/lib/types'

export async function GET(): Promise<NextResponse<AppSettings>> {
  const settings = await getServerSettings()
  return NextResponse.json(settings)
}

export async function POST(request: Request): Promise<NextResponse<AppSettings | { error: string }>> {
  try {
    const body = (await request.json()) as Partial<AppSettings>
    const settings = await saveServerSettings(normalizeSettings(body))
    return NextResponse.json(settings)
  } catch {
    return NextResponse.json({ error: 'Gagal menyimpan pengaturan.' }, { status: 500 })
  }
}
