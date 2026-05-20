'use client'

import { Save } from 'lucide-react'
import { FormEvent, useEffect, useState } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { DEFAULT_SETTINGS } from '@/lib/settings'
import type { AppSettings } from '@/lib/types'

const EMPTY_SETTINGS: AppSettings = DEFAULT_SETTINGS

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(EMPTY_SETTINGS)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function loadSettings() {
      const response = await fetch('/api/settings')
      if (!response.ok) return
      setSettings((await response.json()) as AppSettings)
    }

    loadSettings()
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const response = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    })

    if (!response.ok) return

    setSettings((await response.json()) as AppSettings)
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2500)
  }

  function handleLogoUpload(file: File | undefined) {
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      setSettings({ ...settings, logo_data_url: String(reader.result) })
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="stack">
      <PageHeader title="Pengaturan Institusi" description="Data ini dipakai pada semua slip gaji yang digenerate." />

      <section className="card">
        <form className="card__body form-grid" onSubmit={handleSubmit}>
          <Field label="Nama Institusi" value={settings.nama_institusi} placeholder="GRIYA QUR'AN TARTIILAA" onChange={(value) => setSettings({ ...settings, nama_institusi: value })} />
          <Field label="Kota Tanda Tangan" value={settings.kota_ttd} placeholder="Salatiga" onChange={(value) => setSettings({ ...settings, kota_ttd: value })} />
          <Field label="Nama Bendahara" value={settings.nama_bendahara} placeholder="Tri Wahyuniati" onChange={(value) => setSettings({ ...settings, nama_bendahara: value })} />
          <Field label="Jabatan Bendahara" value={settings.jabatan_bendahara} placeholder="Bendahara GQT" onChange={(value) => setSettings({ ...settings, jabatan_bendahara: value })} />
          <Field label="Kampus" value={settings.kampus} placeholder="Kampus GQT Salatiga" onChange={(value) => setSettings({ ...settings, kampus: value })} />

          <div className="form-field">
            <label>Logo Institusi</label>
            <input type="file" accept="image/png,image/jpeg" onChange={(event) => handleLogoUpload(event.target.files?.[0])} />
            <small>Logo disimpan di browser bersama pengaturan. Gunakan PNG/JPG ukuran kecil agar masuk ke PDF.</small>
            {settings.logo_data_url ? (
              <div className="settings-logo-preview">
                <img src={settings.logo_data_url} alt="Preview logo institusi" />
                <button className="button" type="button" onClick={() => setSettings({ ...settings, logo_data_url: '' })}>Hapus Logo</button>
              </div>
            ) : null}
          </div>

          <div className="actions">
            <button className="button button--primary" type="submit">
              <Save size={16} /> Simpan Pengaturan
            </button>
          </div>

          {saved ? <div className="alert alert--success">Pengaturan berhasil disimpan.</div> : null}
        </form>
      </section>
    </div>
  )
}

function Field({ label, value, placeholder, onChange }: { label: string; value: string; placeholder: string; onChange: (value: string) => void }) {
  return (
    <div className="form-field">
      <label>{label}</label>
      <input value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
    </div>
  )
}
