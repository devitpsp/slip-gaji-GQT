interface ZipFile {
  name: string
  data: ArrayBuffer
}

interface CentralDirectoryEntry {
  nameBytes: Uint8Array
  crc: number
  size: number
  offset: number
}

const encoder = new TextEncoder()
const CRC_TABLE = createCrcTable()

export function createZip(files: ZipFile[]): Uint8Array {
  const chunks: Uint8Array[] = []
  const entries: CentralDirectoryEntry[] = []
  let offset = 0

  for (const file of files) {
    const nameBytes = encoder.encode(file.name)
    const data = new Uint8Array(file.data)
    const crc = crc32(data)
    const localHeader = createLocalHeader(nameBytes, crc, data.byteLength)

    chunks.push(localHeader, data)
    entries.push({ nameBytes, crc, size: data.byteLength, offset })
    offset += localHeader.byteLength + data.byteLength
  }

  const centralDirectoryOffset = offset

  for (const entry of entries) {
    const centralDirectory = createCentralDirectoryHeader(entry)
    chunks.push(centralDirectory)
    offset += centralDirectory.byteLength
  }

  chunks.push(createEndOfCentralDirectory(entries.length, offset - centralDirectoryOffset, centralDirectoryOffset))

  return concatChunks(chunks)
}

function createLocalHeader(nameBytes: Uint8Array, crc: number, size: number): Uint8Array {
  const header = new Uint8Array(30 + nameBytes.byteLength)
  const view = new DataView(header.buffer)

  view.setUint32(0, 0x04034b50, true)
  view.setUint16(4, 20, true)
  view.setUint16(6, 0x0800, true)
  view.setUint16(8, 0, true)
  view.setUint16(10, 0, true)
  view.setUint16(12, 33, true)
  view.setUint32(14, crc, true)
  view.setUint32(18, size, true)
  view.setUint32(22, size, true)
  view.setUint16(26, nameBytes.byteLength, true)
  view.setUint16(28, 0, true)
  header.set(nameBytes, 30)

  return header
}

function createCentralDirectoryHeader(entry: CentralDirectoryEntry): Uint8Array {
  const header = new Uint8Array(46 + entry.nameBytes.byteLength)
  const view = new DataView(header.buffer)

  view.setUint32(0, 0x02014b50, true)
  view.setUint16(4, 20, true)
  view.setUint16(6, 20, true)
  view.setUint16(8, 0x0800, true)
  view.setUint16(10, 0, true)
  view.setUint16(12, 0, true)
  view.setUint16(14, 33, true)
  view.setUint32(16, entry.crc, true)
  view.setUint32(20, entry.size, true)
  view.setUint32(24, entry.size, true)
  view.setUint16(28, entry.nameBytes.byteLength, true)
  view.setUint16(30, 0, true)
  view.setUint16(32, 0, true)
  view.setUint16(34, 0, true)
  view.setUint16(36, 0, true)
  view.setUint32(38, 0, true)
  view.setUint32(42, entry.offset, true)
  header.set(entry.nameBytes, 46)

  return header
}

function createEndOfCentralDirectory(entryCount: number, centralDirectorySize: number, centralDirectoryOffset: number): Uint8Array {
  const header = new Uint8Array(22)
  const view = new DataView(header.buffer)

  view.setUint32(0, 0x06054b50, true)
  view.setUint16(4, 0, true)
  view.setUint16(6, 0, true)
  view.setUint16(8, entryCount, true)
  view.setUint16(10, entryCount, true)
  view.setUint32(12, centralDirectorySize, true)
  view.setUint32(16, centralDirectoryOffset, true)
  view.setUint16(20, 0, true)

  return header
}

function concatChunks(chunks: Uint8Array[]): Uint8Array {
  const length = chunks.reduce((total, chunk) => total + chunk.byteLength, 0)
  const combined = new Uint8Array(length)
  let offset = 0

  for (const chunk of chunks) {
    combined.set(chunk, offset)
    offset += chunk.byteLength
  }

  return combined
}

function createCrcTable(): Uint32Array {
  const table = new Uint32Array(256)

  for (let index = 0; index < 256; index += 1) {
    let value = index

    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1
    }

    table[index] = value >>> 0
  }

  return table
}

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff

  for (const byte of data) {
    crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  }

  return (crc ^ 0xffffffff) >>> 0
}
