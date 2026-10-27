import { defineCard } from "../define.js";
import type { ModeOption } from "../../effects.js";
import type { Color } from "../../mana.js";

// Invasion (INV). EDHREC rank 19094.
//
// Rulings:
//   [2004-10-04] If you change the color of a spell which is to become a permanent, the permanent
//     will retain the color change until the end of the turn.
//
// Illusion's shape: one colour, chosen as it resolves — one mode per colour.

const TEXT = "{1}{U}: Target spell or permanent becomes the color of your choice until end of turn.";
const COLORS: readonly (readonly [Color, string])[] = [
  ["W", "White"],
  ["U", "Blue"],
  ["B", "Black"],
  ["R", "Red"],
  ["G", "Green"],
];
const MODES: ModeOption[] = COLORS.map(([color, word]) => ({
  text: word,
  effect: { kind: "become-color", target: 0, colors: [color], duration: "end-of-turn" },
}));

export default defineCard({
  name: "Blind Seer",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 3,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}{U}", tap: false },
      targets: [{ kind: "spell-or-permanent" }],
      effect: { kind: "modal", minModes: 1, maxModes: 1, modes: MODES },
      resolve: null,
      text: TEXT,
    },
  ],
});
