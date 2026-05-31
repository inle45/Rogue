// Sons du jeu via Web Audio API — aucune dépendance externe

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  return ctx;
}

function jouer(freq: number, duree: number, type: OscillatorType = 'sine', volume = 0.15, delai = 0) {
  try {
    const c = getCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, c.currentTime + delai);
    gain.gain.linearRampToValueAtTime(volume, c.currentTime + delai + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delai + duree);
    osc.start(c.currentTime + delai);
    osc.stop(c.currentTime + delai + duree + 0.05);
  } catch {}
}

function jouerBruit(duree: number, volume = 0.08, delai = 0) {
  try {
    const c = getCtx();
    const bufferSize = c.sampleRate * duree;
    const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const source = c.createBufferSource();
    const gain = c.createGain();
    const filtre = c.createBiquadFilter();
    filtre.type = 'lowpass';
    filtre.frequency.value = 800;
    source.buffer = buffer;
    source.connect(filtre);
    filtre.connect(gain);
    gain.connect(c.destination);
    gain.gain.setValueAtTime(volume, c.currentTime + delai);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delai + duree);
    source.start(c.currentTime + delai);
    source.stop(c.currentTime + delai + duree + 0.05);
  } catch {}
}

export const Audio = {
  coup: () => {
    jouerBruit(0.07, 0.12);
    jouer(180, 0.06, 'square', 0.05, 0.01);
  },

  capacite: (type: string) => {
    const freqBase: Record<string, number> = {
      fire: 440, water: 330, grass: 370, electric: 660,
      psychic: 550, ice: 294, fighting: 220, dragon: 196,
      ghost: 185, dark: 165, normal: 392, poison: 311,
      ground: 246, flying: 494, bug: 415, rock: 261,
      steel: 587, fairy: 523,
    };
    const f = freqBase[type] ?? 440;
    jouer(f, 0.12, 'sine', 0.18);
    jouer(f * 1.25, 0.10, 'sine', 0.1, 0.08);
    jouer(f * 1.5, 0.08, 'sine', 0.07, 0.16);
  },

  achat: () => {
    jouer(523, 0.08, 'sine', 0.2);
    jouer(659, 0.1, 'sine', 0.15, 0.07);
  },

  vente: () => {
    jouer(392, 0.07, 'sine', 0.12);
    jouer(330, 0.08, 'sine', 0.1, 0.06);
  },

  victoire: () => {
    [523, 659, 784, 1047].forEach((f, i) => jouer(f, 0.18, 'sine', 0.2, i * 0.12));
  },

  defaite: () => {
    [392, 330, 277, 220].forEach((f, i) => jouer(f, 0.22, 'sine', 0.18, i * 0.14));
  },

  clic: () => {
    jouer(880, 0.04, 'sine', 0.08);
  },

  refresh: () => {
    jouer(440, 0.06, 'triangle', 0.1);
    jouer(550, 0.06, 'triangle', 0.08, 0.05);
  },
};
