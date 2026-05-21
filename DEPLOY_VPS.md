# Deploy VPS — Slip Gaji Generator

Panduan recommended: deploy dengan Docker Compose di VPS. Settings global disimpan di Docker volume `/app/data`, jadi tidak hilang saat container restart/rebuild.

## 1. Requirement VPS

- Ubuntu 22.04/24.04 atau sejenis
- Docker
- Docker Compose plugin
- Nginx

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg nginx
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker $USER
```

Logout/login ulang setelah `usermod`, atau jalankan dengan `sudo docker` sementara.

## 2. Upload / Clone Project

```bash
mkdir -p /var/www
cd /var/www
# clone repo atau upload folder project ke:
# /var/www/slip-gaji-tartila
cd /var/www/slip-gaji-tartila
```

## 3. Build dan Run dengan Docker Compose

```bash
docker compose up -d --build
```

Cek status dan log:

```bash
docker compose ps
docker compose logs -f slip-gaji
```

Aplikasi berjalan di port host `3000`.

## 4. Nginx Reverse Proxy

Buat config:

```bash
sudo nano /etc/nginx/sites-available/slip-gaji-tartila
```

Isi contoh. Ganti `domain-anda.com` dengan domain/subdomain VPS:

```nginx
server {
    listen 80;
    server_name domain-anda.com www.domain-anda.com;

    client_max_body_size 20M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Aktifkan:

```bash
sudo ln -s /etc/nginx/sites-available/slip-gaji-tartila /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 5. SSL HTTPS dengan Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d domain-anda.com -d www.domain-anda.com
```

## 6. Settings Persistent

Settings global tersimpan di container path:

```text
/app/data/settings.json
```

Di `docker-compose.yml`, path itu dipersist ke named volume:

```text
slip_gaji_data
```

Backup settings:

```bash
docker compose exec slip-gaji cat /app/data/settings.json > settings-backup.json
```

Restore settings:

```bash
docker compose cp settings-backup.json slip-gaji:/app/data/settings.json
docker compose restart slip-gaji
```

## 7. Update Aplikasi

Jika pakai git:

```bash
cd /var/www/slip-gaji-tartila
git pull
docker compose up -d --build
```

Volume `slip_gaji_data` tetap aman selama tidak dihapus.

Jangan jalankan:

```bash
docker compose down -v
```

Karena `-v` akan menghapus volume settings.

## 8. Test Setelah Deploy

- Buka `https://domain-anda.com`
- Buka Settings, simpan data institusi
- Buka dari browser lain/device lain, pastikan Settings sama
- Upload template Excel
- Preview slip
- Download PDF satu slip
- Download Semua PDF

## 9. Alternatif Tanpa Docker

Kalau tidak pakai Docker, bisa run Node langsung:

```bash
npm install
npm run build
npm run start
```

Untuk production tanpa Docker, gunakan PM2:

```bash
sudo npm install -g pm2
pm2 start npm --name slip-gaji-tartila -- start
pm2 save
pm2 startup
```

Settings tersimpan di folder project:

```text
data/settings.json
```

## Catatan

- Deploy VPS cocok dengan storage JSON file.
- Deploy Vercel/serverless tidak cocok dengan `data/settings.json`; jika pindah ke Vercel, storage perlu diganti ke Vercel KV/Supabase.
