import { randomBytes } from 'node:crypto'
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const SHARE_DIR = join(process.cwd(), 'data', 'shared-pdfs')
const META_EXTENSION = '.json'
const PDF_EXTENSION = '.pdf'
export const SHARE_EXPIRY_DAYS = 30

export interface SharedPdfMeta {
  id: string
  fileName: string
  createdAt: string
  expiresAt: string
}

export interface SharedPdfRecord {
  meta: SharedPdfMeta
  pdf: Buffer
}

export async function saveSharedPdf(pdf: ArrayBuffer, fileName: string): Promise<SharedPdfMeta> {
  await mkdir(SHARE_DIR, { recursive: true })

  const id = randomBytes(16).toString('hex')
  const createdAt = new Date()
  const expiresAt = new Date(createdAt.getTime() + SHARE_EXPIRY_DAYS * 24 * 60 * 60 * 1000)
  const meta: SharedPdfMeta = {
    id,
    fileName,
    createdAt: createdAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
  }

  await writeFile(pdfPath(id), Buffer.from(pdf))
  await writeFile(metaPath(id), JSON.stringify(meta, null, 2), 'utf8')

  return meta
}

export async function getSharedPdf(id: string): Promise<SharedPdfRecord | null> {
  if (!isValidShareId(id)) return null

  try {
    const meta = JSON.parse(await readFile(metaPath(id), 'utf8')) as SharedPdfMeta

    if (isExpired(meta)) {
      await deleteSharedPdf(id)
      return null
    }

    return { meta, pdf: await readFile(pdfPath(id)) }
  } catch {
    return null
  }
}

export function isValidShareId(id: string): boolean {
  return /^[a-f0-9]{32}$/.test(id)
}

function isExpired(meta: SharedPdfMeta): boolean {
  return new Date(meta.expiresAt).getTime() <= Date.now()
}

async function deleteSharedPdf(id: string): Promise<void> {
  await Promise.allSettled([unlink(pdfPath(id)), unlink(metaPath(id))])
}

function pdfPath(id: string): string {
  return join(SHARE_DIR, `${id}${PDF_EXTENSION}`)
}

function metaPath(id: string): string {
  return join(SHARE_DIR, `${id}${META_EXTENSION}`)
}
