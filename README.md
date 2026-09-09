# LAPA World

Un piccolo mondo 3D da esplorare a bordo di un camion LAPA.

**Gioca:** https://teo-lapa.github.io/lapa-world/

## Primo capitolo

- **Piccoli piloti (3–4 anni):** cinque consegne con immagini, prodotti da caricare e guida assistita.
- **Esploratori (7–8 anni):** cinque consegne con conteggi, addizioni e sottrazioni.
- Profili con nome e stelle separati, salvati sul dispositivo.
- Deposito con tre zone, camion animato, pizzeria e panetteria in un paesaggio 3D originale.
- Comandi touch e tastiera, istruzioni vocali opzionali, suoni, movimento ridotto.
- Web app installabile, con livelli e risorse disponibili offline dopo il primo caricamento completo.

La strategia aziendale e il maneggio sono idee per capitoli successivi e non fanno parte di questa versione. Non ci sono account online, chat, pubblicità o acquisti.

## Come giocare

1. Inserisci un soprannome e scegli il percorso.
2. Scegli una consegna e tocca i prodotti dell'ordine per caricarli.
3. Premi **Partiamo**, poi tieni premuto il grande pulsante di guida (o Spazio / Freccia su sul computer).
4. Arrivato dal cliente, tocca le cassette per consegnarle.
5. Nel percorso Esploratori rispondi alla domanda e conquista tre stelle.

Gli errori si possono correggere senza penalità. Per togliere una cassetta prima della partenza, toccala nella fila “Sul camion”. Le stelle si conservano separatamente per ogni profilo, anche rigiocando i livelli.

## Installazione

- **iPhone/iPad:** apri il link in Safari → Condividi → Aggiungi alla schermata Home.
- **Android:** apri il link in Chrome → menu → Installa app / Aggiungi a schermata Home.
- Il pulsante di installazione nel gioco contiene le istruzioni e lo stato offline.

I salvataggi sono locali: cancellare i dati del sito o cambiare dispositivo non conserva automaticamente i progressi. La voce dipende dalle voci installate sul dispositivo; i testi e il gioco funzionano anche senza voce. È necessario un browser con WebGL. La fluidità dipende dall'hardware.

## Sviluppo

Node.js 22, npm.

```sh
npm ci
npm run dev
npm test
npm run build
npm run preview
```

Apri `/lapa-world/` sull'indirizzo del server locale. La base del progetto è configurata per GitHub Pages in `vite.config.js`.

Per le verifiche browser e la generazione delle icone occorre Chrome/Chromium. Se non viene trovato automaticamente, imposta `BROWSER_PATH` al percorso dell'eseguibile.

```sh
node scripts/icons.mjs
node scripts/check-browser.mjs
```

## Componenti e risorse

Three.js, Vite, vite-plugin-pwa; caratteri Baloo 2 e Nunito inclusi localmente tramite Fontsource, distribuiti secondo le rispettive licenze OFL nei pacchetti. Geometrie del mondo e icona del camion realizzate per questo progetto. Marchio e logo LAPA appartengono ai rispettivi titolari.
