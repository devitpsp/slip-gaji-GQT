import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import { calculateSlip } from '@/lib/calculateSlip'
import { formatNumber, formatRupiah } from '@/lib/formatRupiah'
import { getTanggalTtd } from '@/lib/settings'
import type { AppSettings, SlipData } from '@/lib/types'

interface SlipPdfDocumentProps {
  data: SlipData | SlipData[]
  settings: AppSettings
  tanggalTtd?: string
  logoSource?: string
}

export function SlipPdfDocument({ data, settings, tanggalTtd, logoSource }: SlipPdfDocumentProps) {
  const slips = Array.isArray(data) ? data : [data]

  return (
    <Document>
      {slips.map((slip) => (
        <SlipPdfPage key={`${slip.no}-${slip.nama}`} data={slip} settings={settings} tanggalTtd={tanggalTtd} logoSource={logoSource} />
      ))}
    </Document>
  )
}

function SlipPdfPage({ data, settings, tanggalTtd, logoSource }: { data: SlipData; settings: AppSettings; tanggalTtd?: string; logoSource?: string }) {
  const calculated = calculateSlip(data)

  return (
    <Page size="A5" style={styles.page}>
      <Text style={styles.title}>SLIP GAJI {settings.nama_institusi}</Text>
      <Text style={styles.subtitle}>Periode: {data.periode_lengkap}</Text>

      <View style={styles.box}>
        <View style={styles.topGrid}>
          <View style={styles.info}>
            <Text>No      : {data.no}</Text>
            <Text>Nama    : {data.nama}</Text>
            <Text>Kampus  : {settings.kampus}</Text>
            <Text>Periode : {data.periode}</Text>
          </View>
          <View style={styles.logo}>{logoSource ? <Image src={logoSource} style={styles.logoImage} /> : <Text>LOGO</Text>}</View>
        </View>
      </View>

      <View style={styles.box}>
        <Text style={[styles.row, styles.center]}>Rincian</Text>
        <PdfRow label="Transport per datang" value={formatRupiah(data.transport_per_datang)} />
        <PdfRow label="Jumlah Hadir" value={formatNumber(data.jumlah_hadir)} />
        <PdfRow label="Subtotal Transport" value={formatRupiah(calculated.subtotal_transport)} />
        <PdfRow label="Tunjangan" value={formatRupiah(data.tunjangan)} />
        <PdfRow label="THR" value={formatRupiah(data.thr)} />
        <PdfRow label="Potongan" value={formatRupiah(data.potongan)} />
        <View style={[styles.rowView, styles.total]}>
          <Text>Total Penerimaan</Text>
          <Text>{formatRupiah(calculated.total_penerimaan)}</Text>
        </View>
      </View>

      <View style={[styles.box, styles.signature]}>
        <View>
          <Text>Mengetahui,</Text>
          <Text>{settings.kota_ttd}, {tanggalTtd ?? getTanggalTtd()}</Text>
        </View>
        <View>
          <Text style={styles.bold}>{settings.nama_bendahara}</Text>
          <Text>{settings.jabatan_bendahara}</Text>
        </View>
      </View>
    </Page>
  )
}

function PdfRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.rowView}>
      <Text>{label}</Text>
      <Text style={styles.bold}>{value}</Text>
    </View>
  )
}


const styles = StyleSheet.create({
  page: { padding: 28, fontSize: 10, fontFamily: 'Helvetica', color: '#111827' },
  title: { textAlign: 'center', fontSize: 15, fontWeight: 700 },
  subtitle: { marginTop: 4, textAlign: 'center', fontSize: 10 },
  box: { marginTop: 12, border: '1px solid #111827' },
  topGrid: { flexDirection: 'row' },
  info: { flex: 1, padding: 10, gap: 5 },
  logo: { width: 82, borderLeft: '1px solid #111827', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' },
  logoImage: { width: 56, height: 56, objectFit: 'contain' },
  row: { padding: 7, borderBottom: '1px solid #111827' },
  rowView: { padding: 7, borderTop: '1px solid #111827', flexDirection: 'row', justifyContent: 'space-between', gap: 16 },
  center: { textAlign: 'center', fontWeight: 700 },
  total: { borderTop: '2px solid #111827', fontSize: 13, fontWeight: 700 },
  signature: { minHeight: 142, padding: 10, justifyContent: 'space-between' },
  bold: { fontWeight: 700 },
})
