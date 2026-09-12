export const PRODUCTS = {
  tomato: { name: 'Pomodori', emoji: '🍅', color: '#e35b43', zone: 'Secco' },
  flour: { name: 'Farina', emoji: '🌾', color: '#eec76e', zone: 'Secco' },
  cheese: { name: 'Mozzarella', emoji: '🧀', color: '#f6e4ad', zone: 'Fresco' },
  apple: { name: 'Mele', emoji: '🍎', color: '#95bf6f', zone: 'Fresco' },
  milk: { name: 'Latte', emoji: '🥛', color: '#8dcada', zone: 'Fresco' },
  ice: { name: 'Gelato', emoji: '🍦', color: '#c3a7d3', zone: 'Congelato' },
};

export const MODES = {
  little: { name: 'Piccoli piloti', age: '3–4 anni', icon: '🚚', description: 'Tocca, carica e parti!', color: '#d83b35' },
  explorer: { name: 'Esploratori', age: '7–8 anni', icon: '🧭', description: 'Consegne e piccoli enigmi', color: '#327866' },
};

export const ORIGINAL_LEVELS = {
  little: [
    { title: 'La prima consegna', destination: 'pizzeria', order: { tomato: 1 }, intro: 'Il cuoco aspetta i pomodori. Li portiamo noi!', sticker: '🍅' },
    { title: 'Una pizza speciale', destination: 'pizzeria', order: { flour: 1, tomato: 1 }, intro: 'Farina e pomodori: oggi si prepara la pizza!', sticker: '🍕' },
    { title: 'Un camion pieno', destination: 'pizzeria', order: { flour: 2, cheese: 1 }, intro: 'Due cassette di farina e una di mozzarella. Si parte!', sticker: '🚚' },
    { title: 'Profumo di torta', destination: 'bakery', order: { apple: 2, milk: 1 }, intro: 'Il fornaio prepara una torta di mele!', sticker: '🥧' },
    { title: 'La festa in paese', destination: 'pizzeria', order: { tomato: 2, flour: 1, cheese: 1 }, intro: 'Tutti a tavola! Portiamo gli ingredienti per la festa.', sticker: '🎈' },
  ],
  explorer: [
    { title: 'Contiamo le cassette', destination: 'pizzeria', order: { flour: 2, tomato: 3 }, intro: 'Un ordine per la pizzeria. Contiamo bene le cassette!', sticker: '🍕', quiz: { question: '2 cassette di farina e 3 di pomodori. Quante in tutto?', picture: '🌾 🌾 + 🍅 🍅 🍅', answer: 5, options: [4, 5, 6], hint: 'Conta le due cassette di farina, poi aggiungi le tre di pomodori.' } },
    { title: 'La torta del fornaio', destination: 'bakery', order: { apple: 4, milk: 2 }, intro: 'Oggi il fornaio ha un ordine bello grande!', sticker: '🥧', quiz: { question: 'Il fornaio usa 1 delle 4 cassette di mele. Quante ne restano?', picture: '🍎 🍎 🍎 🍎 − 🍎', answer: 3, options: [2, 4, 3], hint: 'Parti da quattro mele e togline una.' } },
    { title: 'La squadra della pizza', destination: 'pizzeria', order: { cheese: 3, tomato: 2, flour: 1 }, intro: 'Tre prodotti diversi. Ogni cassetta conta!', sticker: '🧀', quiz: { question: 'Hai portato 3 mozzarelle, 2 pomodori e 1 farina. Quante cassette?', picture: '🧀 🧀 🧀 + 🍅 🍅 + 🌾', answer: 6, options: [6, 5, 7], hint: 'Tre più due fa cinque. Aggiungi ancora una cassetta.' } },
    { title: 'Una merenda fresca', destination: 'bakery', order: { milk: 2, ice: 2, flour: 2 }, intro: 'Latte, gelato e farina per una merenda speciale.', sticker: '🍦', quiz: { question: '2 cassette su ogni scaffale, per 3 scaffali. Quante sono?', picture: '🥛 🥛   🍦 🍦   🌾 🌾', answer: 6, options: [4, 8, 6], hint: 'Conta due, poi quattro, poi sei.' } },
    { title: 'La grande festa LAPA', destination: 'pizzeria', order: { tomato: 3, flour: 2, cheese: 3 }, intro: 'Otto cassette per la festa. Organizziamo la consegna!', sticker: '🏆', quiz: { question: 'Delle 8 cassette, il cuoco ne sistema 3. Quante restano da sistemare?', picture: '8 − 3 = ?', answer: 5, options: [5, 6, 4], hint: 'Parti da otto e togli tre: sette, sei, cinque.' } },
  ],
};

