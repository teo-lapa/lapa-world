import { LEVELS } from '../src/game.js';

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
  ...['Pizzeria Sole','Forno del Borgo'].flatMap(customer=>[
    `Si parte per ${customer}! Tieni premuto il pulsante per guidare.`,
    `Siamo arrivati! Tocca le cassette per consegnarle a ${customer}.`,
  ]),
  ...Object.values(LEVELS).flatMap(levels=>levels.flatMap(level=>[
    `${level.intro} Tocca i prodotti per caricarli sul camion.`,
    ...(level.quiz?[level.quiz.question,level.quiz.hint]:[]),
  ])),
])];
