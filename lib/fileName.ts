import type { SlipData } from './types'

export function safeFileName(value: string): string {
  return value.replace(/[^a-z0-9-_]+/gi, '_')
}

export function slipPdfFileName(slip: SlipData): string {
  return `${safeFileName(slip.nama)}_SlipGaji_${safeFileName(slip.periode)}.pdf`
}
