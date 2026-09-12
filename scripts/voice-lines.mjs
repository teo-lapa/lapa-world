import { LEVELS } from '../src/game.js';
import { CUSTOMERS, bonusLevel } from '../src/campaign.js';

// Fixed campaign copy only: never synthesize player names or variable bonus titles.
const levels = Object.entries(LEVELS).flatMap(([mode, campaign]) => [
  ...campaign,
  ...Array.from({ length: 200 }, (_, round) => bonusLevel(mode, round)),
]);

export const voiceLines=[...new Set([
  'Benvenuto a bordo! Scegli la tua prima consegna.',
  'Scegli un’avventura e sali sul camion!',
  'Consegna completata! Hai guadagnato tre stelle!',
  'Perfetto! Il camion è pronto. Partiamo!',
  'Audio attivato.',
  'Ora seguiamo la consegna.',
  'Guarda le figure dell’ordine: ci serve un altro prodotto.',
  'Di questo prodotto ne abbiamo già abbastanza!',
  'Questa cassetta non è sul camion.',
  'Carichiamo prima tutte le cassette dell’ordine.',
  'Prima raggiungiamo il cliente.',
  'Questa cassetta non si può scaricare adesso.',
  'Prima completiamo la consegna.',
  'Acquistiamo solo i prodotti indicati nell’ordine.',
  'Non ci sono abbastanza monete per questa cassetta.',
  'Controlla la dispensa e acquista le cassette mancanti.',
  'Ascolta il cliente e cerca il prodotto che desidera.',
  'Prima prepariamo tutti i prodotti.',
  ...Object.values(CUSTOMERS).flatMap(({ name: customer })=>[
    `Si parte per ${customer}! Tieni premuto il pulsante per guidare.`,
    `Siamo arrivati! Tocca le cassette per consegnarle a ${customer}.`,
  ]),
  ...levels.flatMap(level=>[
    ...(level.kind === 'visit' ? [level.intro, level.visitText] :
      [`${level.intro} Tocca i prodotti per caricarli sul camion.`]),
    ...(level.quiz?[level.quiz.question,level.quiz.hint]:[]),
  ]),
])];
