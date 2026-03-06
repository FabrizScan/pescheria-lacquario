# CLAUDE.md — Pescheria L'Acquario Molinella · Nuovo Sito Web

## Contesto del Progetto

Rifacimento completo del sito web di **Pescheria L'Acquario**, pescheria storica dal 1984 a Molinella (BO).
Sito attuale: https://www.pescherialacquariomolinella.com/ — costruito su Wix, layout monocolonna, nessuna SEO strutturata, nessun sistema di prenotazione.

### Obiettivi

- Design moderno, mobile-first, performante
- Testi riscritti per **AEO/LLM SEO** (risposte dirette, dati strutturati, entità chiare)
- Form contatti migliorato
- Form prenotazione online (frontend only per ora, backend da aggiungere)
- Deploy su **Cloudflare Pages** (frontend) + **Cloudflare Workers** (form/API)
- Mantenere link Facebook e TripAdvisor
- Nessuna chat live (inutile per una pescheria locale, overhead non giustificato)

---

## Stack Tecnico

### Frontend

- **Vanilla HTML + CSS + JavaScript** (no framework)
  - Sito vetrina semplice, nessuna complessità di stato
  - Build zero, deploy diretto su Cloudflare Pages
  - Performance massima, nessun bundle overhead
- **Google Fonts** via CDN (font display swap)
- **CSS custom properties** per temi e consistenza visiva
- **No dipendenze npm** per il frontend (opzionale: `npm run dev` con live server locale)

### Backend / Form

- **Cloudflare Workers** per gestire submission dei form
  - `/api/contact` — form contatti
  - `/api/booking` — form prenotazioni
- Storage temporaneo: **Cloudflare KV** o **D1** (SQLite) per le prenotazioni
- Email notifiche: **Resend** o **MailChannels** (integrato in Workers gratuitamente)

### Deploy

- **Cloudflare Pages** per il sito statico
- **Cloudflare Workers** collegati come Functions (`/functions/api/`)
- DNS già su Cloudflare (verificare)
- Dominio attuale: `pescherialacquariomolinella.com`

---

## Struttura del Progetto

```
pescheria-acquario/
├── CLAUDE.md
├── package.json          # solo devDependencies: live-server o vite (opzionale)
├── wrangler.toml         # config Cloudflare Workers/Pages
├── public/               # sito statico → Cloudflare Pages
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── main.js
│   └── assets/
│       └── images/
├── functions/            # Cloudflare Workers (Pages Functions)
│   └── api/
│       ├── contact.js    # POST /api/contact
│       └── booking.js    # POST /api/booking
└── README.md
```

---

## Pagine e Contenuto

### `index.html` (One-page con sezioni ancorate)

Struttura consigliata per sito monopagina performante:

1. **`#hero`** — Headline forte + CTA telefono + CTA prenotazione
2. **`#chi-siamo`** — Storia dal 1984, valori, team
3. **`#prodotti`** — Pesce fresco, pesce crudo, pesce cotto, piatti pronti
4. **`#prenotazione`** — Form prenotazione asporto/ritiro
5. **`#contatti`** — Form contatti + mappa + orari + social
6. **`footer`** — P.IVA, link legali, Facebook, TripAdvisor

> Alternativa multi-pagina se preferita: `index.html`, `prodotti.html`, `prenotazione.html`, `contatti.html`

---

## Testi LLM-Optimized (AEO/SEO)

### Principi applicati

- **Risposte dirette** nella prima riga di ogni sezione (risponde a query dirette di AI)
- **Entità esplicite**: nome completo, città, provincia, anno fondazione, specialità
- **Dati strutturati** `<script type="application/ld+json">` — LocalBusiness + FoodEstablishment + FAQPage
- **Meta description** formulata come risposta a domanda
- **H1 univoco e descrittivo** per pagina

### Schema.org da implementare

```json
{
  "@context": "https://schema.org",
  "@type": ["FoodEstablishment", "LocalBusiness"],
  "name": "Pescheria L'Acquario",
  "description": "Pescheria e friggitoria a Molinella (Bologna) dal 1984. Pesce fresco quotidiano, piatti pronti, frittura e crudi su ordinazione.",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Via Mazzini Giuseppe 120",
    "addressLocality": "Molinella",
    "postalCode": "40062",
    "addressRegion": "BO",
    "addressCountry": "IT"
  },
  "telephone": "+39 051 882601",
  "email": "pescherialacquario@outlook.it",
  "foundingDate": "1984",
  "openingHoursSpecification": [...],
  "sameAs": [
    "https://www.facebook.com/profile.php?id=100046238906234",
    "https://www.tripadvisor.it/Restaurant_Review-g1725279-d12082462-..."
  ]
}
```

---

## Form Contatti (Migliorato)

Campi da includere (vs sito attuale che ha solo email + messaggio):

```
- Nome e Cognome *
- Telefono (per risposta rapida)
- Email *
- Oggetto (select: Informazioni prodotti / Ordine personalizzato / Altro)
- Messaggio *
- [Checkbox] Accetto la Privacy Policy
```

Worker endpoint: `POST /api/contact`
Risposta: JSON `{ success: true }` + invio email a `pescherialacquario@outlook.it`

---

## Form Prenotazione Online

> **Nota**: Per ora solo frontend + Worker che salva in KV/D1 e manda email. Nessun sistema calendario completo ancora.

Campi:

```
- Nome e Cognome *
- Telefono *
- Email
- Data ritiro * (datepicker, solo martedì-sabato)
- Ora ritiro * (select: 10:00 / 10:30 / 11:00 / 11:30 / 17:00 / 17:30 / 18:00 / 18:30 / 19:00)
- Tipo ordine * (select: Pesce fresco / Piatto cotto / Frittura / Crudo / Composizione libera)
- Note / dettagli ordine
- [Checkbox] Confermo di voler essere ricontattato per conferma
- [Checkbox] Accetto la Privacy Policy
```

Worker endpoint: `POST /api/booking`
Salva in D1 (tabella `bookings`) + email notifica al gestore

---

## Orari e Info

```
Martedì – Sabato:  mattina e pomeriggio
Domenica/Lunedì:   chiuso
Telefono:          +39 051 882601
Email:             pescherialacquario@outlook.it
Indirizzo:         Via Mazzini Giuseppe 120, 40062 Molinella (BO)
P.IVA:             01011630389
```

---

## Social Links

| Piattaforma | URL                                                                                                                                                          |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Facebook    | https://www.facebook.com/profile.php?id=100046238906234                                                                                                      |
| TripAdvisor | https://www.tripadvisor.it/Restaurant_Review-g1725279-d12082462-Reviews-Pescheria_E_Friggitoria_L_Acquario-Molinella_Province_of_Bologna_Emilia_Romagna.html |

> **Non aggiungere**: WhatsApp widget, live chat, Messenger. Overhead non giustificato per volume di clienti. Il telefono è sufficiente come canale diretto.

---

## Design Guidelines

### Palette colori (proposta)

```css
--color-primary: #0a2540; /* blu notte marino */
--color-accent: #00a99d; /* acqua/teal */
--color-warm: #f5f0e8; /* crema sabbia */
--color-text: #1a1a2e;
--color-text-light: #6b7280;
--color-white: #ffffff;
```

### Tipografia (proposta)

```css
--font-display: "Playfair Display", serif; /* titoli, heritage, autorevolezza */
--font-body: "DM Sans", sans-serif; /* leggibilità moderna */
```

### Tono visivo

- **Coastal refined** — non kitsch, non folkloristico
- Foto prodotto in primo piano (pesce fresco, bancone, piatti)
- Ampio uso di whitespace
- Hero con immagine full-width + overlay scuro + headline bianca

---

## Decisioni Architetturali

| Decisione            | Scelta                   | Motivazione                                                          |
| -------------------- | ------------------------ | -------------------------------------------------------------------- |
| Framework            | Vanilla HTML/CSS/JS      | Zero build, deploy immediato su CF Pages, massima semplicità         |
| Multi vs Single page | Single page (anchor nav) | Sito vetrina, UX fluida, SEO concentrata                             |
| Chat live            | ❌ No                    | Volume clienti locale non lo giustifica, aggiunge dipendenze esterne |
| WhatsApp widget      | ❌ No                    | Il numero di telefono è già in hero e footer                         |
| Form backend         | CF Workers + D1          | Tutto nell'ecosistema Cloudflare, zero infrastruttura extra          |
| Email service        | MailChannels (Workers)   | Gratuito, nativo in CF Workers, zero config aggiuntiva               |

---

## Comandi di Sviluppo

```bash
# Sviluppo locale (con Wrangler)
npx wrangler pages dev public/

# Deploy
npx wrangler pages deploy public/ --project-name=pescheria-acquario

# Dev locale Workers (se separati)
npx wrangler dev functions/api/contact.js
```

---

## TODO / Roadmap

### Fase 1 — MVP (questo sprint)

- [ ] Layout HTML completo (hero, chi siamo, prodotti, form prenotazione, contatti, footer)
- [ ] CSS responsive mobile-first
- [ ] Worker `/api/contact` funzionante con MailChannels
- [ ] Worker `/api/booking` con salvataggio D1 + email
- [ ] Schema.org LocalBusiness implementato
- [ ] Deploy su Cloudflare Pages

### Fase 2 — Miglioramenti

- [ ] Galleria foto prodotti (reali, da richiedere al cliente)
- [ ] Calendario prenotazioni con disponibilità reale (D1 + logica slot)
- [ ] Dashboard admin semplice per vedere le prenotazioni
- [ ] Google Analytics 4 o Cloudflare Web Analytics (privacy-first)
- [ ] Pagina prodotti dedicata con descrizioni ottimizzate per LLM

### Fase 3 — Opzionale

- [ ] Integrazione WhatsApp Business API per conferma prenotazioni automatica
- [ ] Recensioni TripAdvisor in embed o feed statico
