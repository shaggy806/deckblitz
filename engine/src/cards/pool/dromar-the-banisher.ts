import { defineCard } from "../define.js";
import type { ModeOption } from "../../effects.js";
import type { Color } from "../../mana.js";

// Invasion (INV). EDHREC rank 21049.
//
// Rulings:
//   [2004-10-04] You choose the color during resolution. This means your opponent does not get to
//     react after knowing the color you chose.
//
// Vorosh, the Hunter's paid `may`; the colour is chosen after paying, as it
// resolves — one mode per colour (Illusion's shape). Every player's creatures
// of that colour, Dromar included if it has it.

const TEXT =
  "Whenever Dromar deals combat damage to a player, you may pay {2}{U}. If you do, choose a color, then return all creatures of that color to their owners' hands.";
const COLORS: readonly (readonly [Color, string])[] = [
  ["W", "White"],
  ["U", "Blue"],
  ["B", "Black"],
  ["R", "Red"],
  ["G", "Green"],
];
const MODES: ModeOption[] = COLORS.map(([color, word]) => ({
  text: word,
  effect: { kind: "return-to-hand-all", filter: { type: "creature", colors: [color] } },
}));

export default defineCard({
  name: "Dromar, the Banisher",
  manaCost: "{3}{W}{U}{B}",
  colors: ["W", "U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 6,
  toughness: 6,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {2}{U} to return all creatures of a color to their owners' hands?",
        cost: "{2}{U}",
        effect: { kind: "modal", minModes: 1, maxModes: 1, modes: MODES },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
