import type { ModeOption } from "../../effects.js";
import type { Color } from "../../mana.js";
import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 18830.
//
// Rulings:
//   [2004-10-04] You can cast this and choose to target zero creatures and effectively just draw a
//     card.

const COLORS: readonly (readonly [Color, string])[] = [
  ["W", "White"],
  ["U", "Blue"],
  ["B", "Black"],
  ["R", "Red"],
  ["G", "Green"],
];

// One colour, chosen as it resolves, for every target (Sisay's Ingenuity's
// shape over an "any number of" group).
const MODES: ModeOption[] = COLORS.map(([color, word]) => ({
  text: word,
  effect: {
    kind: "for-each-target",
    from: 0,
    effect: { kind: "become-color", target: 0, colors: [color], duration: "end-of-turn" },
  },
}));

export default defineCard({
  name: "Sway of Illusion",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Any number of target creatures become the color of your choice until end of turn.\nDraw a card.",
  targets: [{ kind: "any-number", of: "creature" }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modal", minModes: 1, maxModes: 1, modes: MODES },
      { kind: "draw", amount: 1 },
    ],
  },
});
