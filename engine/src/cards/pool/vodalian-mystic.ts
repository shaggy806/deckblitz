import { defineCard } from "../define.js";
import type { ModeOption } from "../../effects.js";
import type { Color } from "../../mana.js";

// Apocalypse (APC). EDHREC rank 22830.
//
// Alchor's Tomb's shape on a spell: one mode per colour, chosen as the
// ability resolves. Only an instant or sorcery spell — not one cast "any time
// you could cast an instant" (the ruling).
const COLORS: readonly (readonly [Color, string])[] = [
  ["W", "White"],
  ["U", "Blue"],
  ["B", "Black"],
  ["R", "Red"],
  ["G", "Green"],
];

const MODES: ModeOption[] = COLORS.map(([color, word]) => ({
  text: word,
  effect: { kind: "become-color", target: 0, colors: [color], duration: "permanent" },
}));

const TEXT = "{T}: Target instant or sorcery spell becomes the color of your choice.";

export default defineCard({
  name: "Vodalian Mystic",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["instant-or-sorcery-spell"],
      effect: { kind: "modal", minModes: 1, maxModes: 1, modes: MODES },
      resolve: null,
      text: TEXT,
    },
  ],
});
