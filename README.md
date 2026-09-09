# LAPA World

Un piccolo mondo 3D da esplorare a bordo di un camion LAPA.

**Gioca:** https://teo-lapa.github.io/lapa-world/

## Primo capitolo

- **Piccoli piloti (3–4 anni):** cinque consegne con immagini, prodotti da caricare e guida assistita.
- **Esploratori (7–8 anni):** cinque consegne con conteggi, addizioni e sottrazioni.
- Profili con nome e stelle separati, salvati sul dispositivo.
- Deposito con tre zone, camion animato, pizzeria e panetteria in un paesaggio 3D originale.
- Comandi touch e tastiera, istruzioni vocali opzionali, suoni, movimento ridotto.
- Vista dall’interno del furgone, con volante e cruscotto: **Sali a bordo** durante il viaggio.
- Motore con accensione, minimo e accelerazione; il volume si abbassa mentre parla la guida.
- 37 istruzioni con voce italiana neurale incluse nel gioco, disponibili anche offline.
- Web app installabile, con livelli e risorse disponibili offline dopo il primo caricamento completo.

La strategia aziendale e il maneggio sono idee per capitoli successivi e non fanno parte di questa versione. Non ci sono account online, chat, pubblicità o acquisti.

## Come giocare

1. Inserisci un soprannome e scegli il percorso.
2. Scegli una consegna e tocca i prodotti dell'ordine per caricarli.
3. Premi **Partiamo**, poi tieni premuto il grande pulsante di guida (o Spazio / Freccia su sul computer). Con **Sali a bordo** passi nella cabina; **Vista dall’alto** ti riporta al paese. La guida è assistita in entrambe le viste.
4. Arrivato dal cliente, tocca le cassette per consegnarle.
5. Nel percorso Esploratori rispondi alla domanda e conquista tre stelle.

Gli errori si possono correggere senza penalità. Per togliere una cassetta prima della partenza, toccala nella fila “Sul camion”. Le stelle si conservano separatamente per ogni profilo, anche rigiocando i livelli.

## Installazione

- **iPhone/iPad:** apri il link in Safari → Condividi → Aggiungi alla schermata Home.
- **Android:** apri il link in Chrome → menu → Installa app / Aggiungi a schermata Home.
- Il pulsante di installazione nel gioco contiene le istruzioni e lo stato offline.

Il gioco è pubblicato su **GitHub Pages** ed eseguito dal browser del dispositivo: il computer di sviluppo può restare spento. Il repository pubblico contiene il codice; il link per giocare rimane sempre lo stesso. Quando una nuova versione è pronta, sulla mappa compare **Aggiorna il gioco**. Gli aggiornamenti conservano nomi, modalità e stelle sullo stesso dispositivo e browser.

I salvataggi sono locali: cancellare i dati del sito o cambiare dispositivo non conserva automaticamente i progressi. Le istruzioni vocali sono file audio inclusi; la voce del dispositivo viene usata solo come ripiego se un audio non è disponibile. I soprannomi restano sul dispositivo e non vengono inviati a un servizio vocale. È necessario un browser con WebGL. La fluidità dipende dall'hardware.

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
npm run test:audio
```

`npm run test:update` verifica l’aggiornamento reale del service worker da una pubblicazione precedente conservando due profili con stelle. Richiede la precedente cartella pubblicata in `.superpowers/v1-pages`, oppure il percorso indicato in `PREVIOUS_BUILD`; la nuova build va in `dist`.

Le voci distribuite si trovano in `public/audio` con indice in `src/voice-map.json`. Per rigenerarle, installa la dipendenza Python `edge-tts` e avvia `python scripts/generate-voices.py`. Usa solo frasi fisse da `scripts/voice-lines.mjs`, voce italiana Elsa, senza dati dei giocatori. La generazione richiede connessione; la riproduzione nel gioco è locale.

## Componenti e risorse

Three.js, Vite, vite-plugin-pwa; caratteri Baloo 2 e Nunito inclusi localmente tramite Fontsource, distribuiti secondo le rispettive licenze OFL nei pacchetti. Geometrie del mondo e icona del camion realizzate per questo progetto. Marchio e logo LAPA appartengono ai rispettivi titolari.
