import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

const SHUFFLE = "Choose target creature. Its owner shuffles it into their library, then investigates.";
const TOKEN =
  'Create a 2/2 black Alien Angel artifact creature token with first strike, vigilance, and "Whenever an opponent casts a creature spell, this token isn\'t a creature until end of turn."';

const shuffle: EffectSpec = {
  kind: "sequence",
  effects: [
    { kind: "shuffle-into-library", target: 0 },
    { kind: "as-player", who: { ownerOfTarget: 0 }, effect: { kind: "create-token", token: "Clue Token", count: 1 } },
  ],
};
const token: EffectSpec = { kind: "create-token", token: "Alien Angel Token", count: 1 };

export default defineCard({
  name: "Blink",
  manaCost: "{2}{U}{B}",
  colors: ["U", "B"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after IV.)\nI, III — ${SHUFFLE} (They create a Clue token. It's an artifact with "{2}, Sacrifice this token: Draw a card.")\nII, IV — ${TOKEN}`,
  chapters: [
    { at: [1, 3], targets: ["creature"], effect: shuffle, resolve: null, text: `I, III — ${SHUFFLE}` },
    { at: [2, 4], targets: [], effect: token, resolve: null, text: `II, IV — ${TOKEN}` },
  ],
});
