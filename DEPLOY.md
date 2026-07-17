# Deployment-Anleitung: pv-rechner auf Netcup-VPS

Diese Anleitung beschreibt, wie du den **pv-rechner** auf deinem bestehenden
Netcup-VPS deployst. Setzt voraus:

- ✅ **Portainer** läuft im Docker
- ✅ **Nginx Proxy Manager (NPM)** läuft im Docker mit Web-UI auf Port 81
- ✅ Domain `primaflow.de` ist bei **Netcup** registriert
- ✅ A-Record für `primaflow.de` zeigt auf die VPS-IP
- ✅ GitHub-Repo: `https://github.com/RomanHH81/PV-Rechner.git`

---

## Architektur

```
Internet
   │
   ▼
Netcup DNS  (A-Record: pv-rechner.primaflow.de → VPS-IP)
   │
   ▼
Nginx Proxy Manager  :80/:443  (Let's Encrypt, Web-UI :81)
   │
   ▼
pv-rechner Container  (intern :3000, primaflow-net)
```

---

## Schritt 1: DNS-Eintrag bei Netcup setzen

1. Logge dich ins **Netcup CCP** ein: <https://www.customercontrolpanel.de/>
2. Wähle Domain `primaflow.de` → **DNS** → **Einstellungen**
3. Füge einen neuen **A-Record** hinzu:
   - **Name/Host:** `pv-rechner`
   - **Typ:** `A`
   - **Ziel/Wert:** `<VPS-IP>` (z. B. `123.45.67.89`)
   - **TTL:** 300 (5 Minuten, damit Änderungen schnell greifen)
4. Speichern und **5–30 Minuten warten** (DNS-Propagation).

> 💡 Später kannst du statt einzelner A-Records einen **Wildcard** `*` →
> VPS-IP setzen, dann brauchst du für jede Subdomain keinen neuen
> A-Record. Für den Anfang reicht der einzelne A-Record.

**DNS-Check:**

```bash
dig pv-rechner.primaflow.de +short
# sollte die VPS-IP ausgeben
```

---

## Schritt 2: Portainer-Stack anlegen

1. Öffne Portainer (z. B. `https://<VPS-IP>:9443`).
2. Links: **Stacks** → **Add stack**
3. **Name:** `pv-rechner`
4. **Build method:** wähle **Git Repository**
5. Fülle aus:
   - **Repository URL:** `https://github.com/RomanHH81/PV-Rechner.git`
   - **Repository reference:** `refs/heads/docker-setup`
     *(oder `refs/heads/main`, falls du den Branch schon gemergt hast)*
   - **Compose path:** `docker-compose.yml`
6. Klicke **Deploy the stack**.

**Was passiert:**

- Portainer klont den Branch.
- Portainer baut das Docker-Image aus dem `Dockerfile`
  (Multi-Stage, Node 22, Next.js Standalone).
- Container `pv-rechner` startet auf Port 3000.
- Netzwerk `primaflow-net` wird erstellt (falls noch nicht da).
- Healthcheck prüft alle 30 Sekunden, ob der Server antwortet.

**Logs checken:**

- Stacks → `pv-rechner` → Service `pv-rechner` → **Logs**
- Erste Zeile sollte `▲ Next.js ...` zeigen.

**Falls Build fehlschlägt:**

- Häufigste Ursache: Node-Version-Fehler. Schau in die Build-Logs.
- Seltener: OOM (Out-of-Memory) im Build — Portainer erlaubt
  RAM-Limit pro Stack in den erweiterten Einstellungen.

---

## Schritt 3: Nginx Proxy Manager konfigurieren

1. Öffne NPM (z. B. `http://<VPS-IP>:81`).
   - Erste Anmeldung: Standard-Login `admin@example.com` /
     `changeme` (sofort ändern!).
2. **Hosts** → **Proxy Hosts** → **Add Proxy Host**
3. **Details-Tab:**
   - **Domain Names:** `pv-rechner.primaflow.de`
   - **Scheme:** `http`
   - **Forward Hostname / IP:** `pv-rechner`  *(genau der Container-Name!)*
   - **Forward Port:** `3000`
   - ☑️ **Cache Assets**
   - ☑️ **Block Common Exploits**
   - ☑️ **Websockets Support** *(Next.js HMR braucht's nicht in Prod, aber schadet nicht)*
4. **SSL-Tab:**
   - ☑️ **Force SSL**
   - ☑️ **HTTP/2 Support**
   - ☑️ **HSTS Enabled**
   - **SSL Certificate:** → **Request a new SSL Certificate**
     - ☑️ **I Agree to the Let's Encrypt Terms of Service**
     - ☑️ **Wildcard** *nur* wenn du auch eine Wildcard-Subdomain willst
       (für jetzt: **aus**, weil A-Record nur für `pv-rechner`)
     - **Email Address for Let's Encrypt:** deine E-Mail
5. Klick **Save**.

**Wartezeit:** Let's Encrypt braucht 30–120 Sekunden für die Ausstellung.

---

## Schritt 4: Testen

1. Öffne `https://pv-rechner.primaflow.de` im Browser.
2. **Erwartung:** Die PV-Rechner-App lädt, ohne Vercel-Branding in der URL.
3. Browser-Devtools → **Network-Tab** prüfen:
   - Status `200 OK`
   - `server: cloudflare` *sollte nicht da sein* (war Vercel-typisch)
   - Zertifikat-Info: Let's Encrypt, ausgestellt für `pv-rechner.primaflow.de`

**Falls 502 Bad Gateway:**

- Container-Name falsch? In NPM: muss exakt `pv-rechner` sein
  (siehe `container_name` in `docker-compose.yml`).
- Container läuft nicht? Portainer → Containers → Status checken.
- Falsches Netzwerk? Container `pv-rechner` und NPM müssen im
  selben Docker-Netz sein (`primaflow-net`).

**Falls SSL-Fehler in NPM:**

- Let's Encrypt kann die Domain nicht validieren? Häufigste
  Ursache: A-Record zeigt noch nicht auf den VPS (DNS-Propagation).
  Test: `dig pv-rechner.primaflow.de` und schauen, ob die VPS-IP kommt.

---

## Schritt 5 (Optional): Alten Vercel-Deploy stoppen

Erst nachdem `https://pv-rechner.primaflow.de` zuverlässig läuft:

1. **Vercel-Dashboard:** <https://vercel.com/dashboard>
2. Projekt `pv-rechner` → **Settings** → **Domains**
3. Domain `pv-rechner.primaflow.de` **entfernen** (nicht das ganze Projekt
   löschen — du willst den Code behalten).
4. **Vercel-DNS deaktivieren** für die Subdomain.

> ⚠️ **Wichtig:** Vorher sicherstellen, dass der VPS-Deploy 24 h
> gelaufen ist. Sonst ist die Seite offline.

---

## Updates deployen (Workflow)

Wenn du am Code was änderst:

1. Lokal auf dem Mac: feature-Branch, commit, PR nach `main` (oder direkt push).
2. Merge in `main`.
3. Portainer → Stacks → `pv-rechner` → **Pull and redeploy**
   *(Pull-Button: aktualisiert Repo + baut Image neu + restart).*

> Tipp: In Portainer unter **Stacks** kann man auch **GitOps / Auto-Sync**
> aktivieren (Polling alle 5 Min). Macht das Leben einfacher.

---

## Nächste Projekte (gleiche Pattern)

Sobald pv-rechner läuft, folgen:

1. **immobilien-portfolio** (Supabase self-hosted → eigener Stack)
2. **handwerker-referenzwebsite** (Payload CMS + Postgres + MinIO für Blob-Storage)
3. **n8n** (eigener Container, eigene Subdomain)

Jedes bekommt:

- Eigenes Repo-Setup mit `Dockerfile` + `docker-compose.yml`
- Eigener Portainer-Stack
- Eigener NPM-Proxy-Host
- Eigener A-Record (oder gleich Wildcard)

---

## Troubleshooting-Checkliste

| Symptom | Ursache | Fix |
|---|---|---|
| Portainer-Build schlägt fehl: "no space left" | Docker-Volume voll | `docker system prune` auf VPS (Vorsicht!) |
| 502 Bad Gateway nach Deploy | Container noch nicht ready | 30 s warten, dann Browser-Reload |
| SSL-Fehler "NET::ERR_CERT_AUTHORITY_INVALID" | Let's Encrypt noch nicht fertig | 2 min warten, NPM-Logs checken |
| Domain zeigt auf Vercel statt VPS | DNS-Cache | `dig` checken, Browser-DNS-Cache leeren |
| Container restartet ständig | App-Crash in Startup-Phase | Portainer-Logs lesen, `docker logs pv-rechner` |
| 504 Gateway Timeout | pv-rechner zu langsam zum Antworten | Next.js-Build prüfen, ggf. mehr RAM in compose |

