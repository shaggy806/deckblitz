import { defineCard } from "../define.js";
import type { ModeOption } from "../../effects.js";
import type { Color } from "../../mana.js";

// Invasion (INV). EDHREC rank 21659. Vorosh's "you may pay … If you do" shape. The colour is
// chosen as it resolves (the ruling) — one mode per colour (Illusion's shape) — and every
// permanent of that colour counts, whoever controls it.

const TRIGGER_TEXT =
  "Whenever Treva deals combat damage to a player, you may pay {2}{W}. If you do, choose a color, then you gain 1 life for each permanent of that color.";

const COLORS: readonly (readonly [Color, string])[] = [
  ["W", "White"],
  ["U", "Blue"],
  ["B", "Black"],
  ["R", "Red"],
  ["G", "Green"],
];
const MODES: ModeOption[] = COLORS.map(([color, word]) => ({
  text: word,
  effect: { kind: "gain-life", amount: { countOf: { colors: [color] } } },
}));

export default defineCard({
  name: "Treva, the Renewer",
  manaCost: "{3}{G}{W}{U}",
  colors: ["W", "U", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 6,
  toughness: 6,
  keywords: ["flying"],
  text: `Flying\n${TRIGGER_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {2}{W} to choose a color and gain 1 life for each permanent of that color?",
        cost: "{2}{W}",
        effect: { kind: "modal", minModes: 1, maxModes: 1, modes: MODES },
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
