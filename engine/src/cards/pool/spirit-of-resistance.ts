import type { Color } from "../../mana.js";
import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 15992.
//
// Rulings:
//   [2004-10-04] A permanent which is of multiple colors counts as each of its colors.

const TEXT = "As long as you control a permanent of each color, prevent all damage that would be dealt to you.";
const COLORS: readonly Color[] = ["W", "U", "B", "R", "G"];

// One `controls` clause per colour, so a multicoloured permanent answers
// several (the ruling). `countsSelf`: this white enchantment is one of them.
export default defineCard({
  name: "Spirit of Resistance",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: {
        kind: "all",
        of: COLORS.map((color) => ({ kind: "controls" as const, filter: { colors: [color] }, atLeast: 1, countsSelf: true })),
      },
      replacement: { event: "would-deal-damage", prevent: true, to: "you" },
      text: TEXT,
    },
  ],
});
