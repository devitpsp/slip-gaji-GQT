import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { DEFAULT_SETTINGS, normalizeSettings } from '@/lib/settings'
import type { AppSettings } from '@/lib/types'

const SETTINGS_FILE = join(process.cwd(), 'data', 'settings.json')

export async function getServerSettings(): Promise<AppSettings> {
  try {
    const raw = await readFile(SETTINGS_FILE, 'utf8')
    return normalizeSettings(JSON.parse(raw) as Partial<AppSettings>)
  } catch {
    return DEFAULT_SETTINGS
  }
}

export async function saveServerSettings(settings: AppSettings): Promise<AppSettings> {
  const normalized = normalizeSettings(settings)
  await mkdir(dirname(SETTINGS_FILE), { recursive: true })
  await writeFile(SETTINGS_FILE, JSON.stringify(normalized, null, 2), 'utf8')
  return normalized
}
