# LAPA World

Un piccolo mondo 3D da esplorare a bordo di un camion LAPA.

**Gioca:** https://teo-lapa.github.io/lapa-world/

## Un mondo che cresce — versione 2.0

- **Piccoli piloti (3–4 anni):** 40 missioni con immagini, consegne semplici e visite ai clienti. Le nuove consegne richiedono al massimo quattro cassette.
- **Esploratori (7–8 anni):** 60 missioni con consegne, visite, acquisti delle scorte mancanti e piccoli enigmi su quantità e prezzi.
- **Otto zone da scoprire:** si parte dal paese originale. Completando le missioni si aprono viale dei gelati, mercato, campagna, lago, porto, montagna e fiera. Le zone future restano nascoste; la mappa cresce insieme al giocatore.
- 11 clienti e 14 prodotti, con strade, paesaggi e destinazioni nuove. Le visite permettono di scegliere la macchina blu o il camion.
- Negli Esploratori, «La mia LAPA» permette di assumere Marta (carico assistito), Leo (guida opzionale) e ampliare il magazzino (bonus di 5 monete sulle nuove missioni). Le monete sono solo del gioco; ogni missione della campagna le assegna una volta.
- Dopo la campagna, gli **incarichi liberi** continuano a proporre combinazioni di ordini e visite. Le missioni precedenti restano rigiocabili.
- Profili con nome e stelle separati, salvati sul dispositivo.
- Deposito con tre zone, camion animato, negozi, fattoria, hotel, porto e rifugio in un paesaggio 3D originale.
- Comandi touch e tastiera, istruzioni vocali opzionali, suoni, movimento ridotto.
- Vista dall’interno del furgone, con volante e cruscotto: **Sali a bordo** durante il viaggio.
- Motore con accensione, minimo e accelerazione; il volume si abbassa mentre parla la guida.
- 157 istruzioni con voce italiana neurale incluse nel gioco, disponibili anche offline.
- Web app installabile, con livelli e risorse disponibili offline dopo il primo caricamento completo.

I primi cinque livelli e i progressi della versione precedente sono conservati. Chi aveva finito il primo capitolo trova subito la strada per la gelateria. La crescita aziendale è semplice e guidata; il maneggio resta un’idea per capitoli futuri. Non ci sono account online, chat, pubblicità o acquisti con denaro reale.

## Come giocare

1. Inserisci un soprannome e scegli il percorso.
2. Scegli una consegna e tocca i prodotti dell'ordine per caricarli.
3. Premi **Partiamo**, poi tieni premuto il grande pulsante di guida (o Spazio / Freccia su sul computer). Con **Sali a bordo** passi nella cabina; **Vista dall’alto** ti riporta al paese. La guida è assistita in entrambe le viste.
4. Arrivato dal cliente, tocca le cassette per consegnarle.
5. Nel percorso Esploratori rispondi alla domanda e conquista tre stelle.

Le visite iniziano scegliendo il veicolo; all’arrivo si ascolta il cliente e si tocca il prodotto richiesto. Nelle missioni con acquisti, si comprano prima le cassette mancanti usando il budget dell’ordine, separato dalle monete dell’attività. La mappa mostra un quartiere alla volta nella lista missioni: i pulsanti con le nuvole si aprono procedendo. Si può tornare a una zona già visitata con il suo pulsante.

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
npm run test:expansion
```

`npm run test:update` verifica l’aggiornamento reale del service worker dalla pubblicazione precedente conservando due profili con stelle. Richiede la precedente cartella pubblicata in `.superpowers/pre-expansion-pages`, oppure il percorso indicato in `PREVIOUS_BUILD`; la nuova build va in `dist`.

Le voci distribuite si trovano in `public/audio` con indice in `src/voice-map.json`. Per rigenerarle, installa la dipendenza Python `edge-tts` e avvia `python scripts/generate-voices.py`. Usa solo frasi fisse da `scripts/voice-lines.mjs`, voce italiana Elsa, senza dati dei giocatori. La generazione richiede connessione; la riproduzione nel gioco è locale.

## Componenti e risorse

Three.js, Vite, vite-plugin-pwa; caratteri Baloo 2 e Nunito inclusi localmente tramite Fontsource, distribuiti secondo le rispettive licenze OFL nei pacchetti. Geometrie del mondo e icona del camion realizzate per questo progetto. Marchio e logo LAPA appartengono ai rispettivi titolari.
