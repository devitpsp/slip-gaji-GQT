import type { AppSettings } from './types'

export const STORAGE_KEY = 'slip_gaji_settings'

export const DEFAULT_SETTINGS: AppSettings = {
  nama_institusi: "GRIYA QUR'AN TARTIILAA",
  kota_ttd: 'Salatiga',
  nama_bendahara: 'Tri Wahyuniati',
  jabatan_bendahara: 'Bendahara GQT',
  kampus: 'Kampus GQT Salatiga',
  logo_data_url: '',
}

export function getSettings(): AppSettings | null {
  if (typeof window === 'undefined') return null

  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return DEFAULT_SETTINGS

  try {
    return normalizeSettings(JSON.parse(raw) as Partial<AppSettings>)
  } catch {
    return null
  }
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

export function normalizeSettings(settings: Partial<AppSettings>): AppSettings {
  return {
    nama_institusi: settings.nama_institusi ?? DEFAULT_SETTINGS.nama_institusi,
    kota_ttd: settings.kota_ttd ?? DEFAULT_SETTINGS.kota_ttd,
    nama_bendahara: settings.nama_bendahara ?? DEFAULT_SETTINGS.nama_bendahara,
    jabatan_bendahara: settings.jabatan_bendahara ?? DEFAULT_SETTINGS.jabatan_bendahara,
    kampus: settings.kampus ?? DEFAULT_SETTINGS.kampus,
    logo_data_url: settings.logo_data_url ?? DEFAULT_SETTINGS.logo_data_url,
  }
}

export function isSettingsComplete(settings: AppSettings | null): boolean {
  if (!settings) return false

  return Boolean(
    settings.nama_institusi.trim() &&
      settings.kota_ttd.trim() &&
      settings.nama_bendahara.trim() &&
      settings.jabatan_bendahara.trim() &&
      settings.kampus.trim(),
  )
}

export function getTanggalTtd(): string {
  return new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
