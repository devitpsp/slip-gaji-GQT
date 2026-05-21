[2026-05-20 00:00] [slip-gaji-tartila] Read PRD and design baseline → Implementation plan approved
[2026-05-20 00:00] [slip-gaji-tartila] Bootstrap project structure → Created Next.js directories and tracking files
[2026-05-20 00:00] [slip-gaji-tartila] Implement MVP core → Added Excel parser, settings, calculation, PDF API, UI pages, print, ZIP, and template
[2026-05-20 00:00] [slip-gaji-tartila] Add logo setting → Added logo upload to Settings and rendered logo in slip preview/PDF
[2026-05-20 00:00] [slip-gaji-tartila] Add kampus setting → Added Kampus field to Settings and rendered under employee name in slip/PDF
[2026-05-20 00:00] [slip-gaji-tartila] Verify MVP → Typecheck/build passed; home/settings/template/parse-excel/PDF APIs returned success
[2026-05-20 00:00] [slip-gaji-tartila] Improve PDF output → Added uploaded logo support in PDF, combined all slips into one PDF, and adjusted signature spacing
[2026-05-20 00:00] [slip-gaji-tartila] Migrate settings storage → Replaced browser localStorage flow with server JSON settings API
[2026-05-20 00:00] [slip-gaji-tartila] Prepare VPS deployment → Added DEPLOY_VPS.md and verified production readiness
[2026-05-20 00:00] [slip-gaji-tartila] Add Docker VPS deployment → Added Dockerfile, docker-compose.yml, .dockerignore, and persistent data volume notes
[2026-05-20 00:00] [slip-gaji-tartila] Remove slip logo → Removed logo from Settings UI, slip preview, and PDF generation
[2026-05-21 11:11] [slip-gaji-tartila] Set default app logo → Navbar and metadata now use public/GQT-icon.png; build passed
[2026-05-21 11:19] [slip-gaji-tartila] Restore configurable logo → Settings logo upload restored and rendered in slip preview/PDF; build passed
[2026-05-21 12:38] [slip-gaji-tartila] Fix slip logo placement → Default/custom logo now appears inside identity box beside No/Nama/Kampus/Periode in preview and PDF; build passed
[2026-05-21 12:53] [slip-gaji-tartila] Align slip identity with PRD → Info text stays left and logo appears right inside identity box in preview/PDF; build passed
