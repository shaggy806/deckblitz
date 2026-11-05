import type { Color } from "../../mana.js";
import { defineCard } from "../define.js";

const COLORS: readonly [Color, string][] = [
  ["W", "White"],
  ["U", "Blue"],
  ["B", "Black"],
  ["R", "Red"],
  ["G", "Green"],
];

// The color is chosen as it resolves; the prevention covers every source of
// that color, whatever it would deal damage to, for the rest of the turn.
export default defineCard({
  name: "Prismatic Strands",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  flashback: { cost: "", tapCreatures: { filter: { type: "creature", colors: ["W"] }, count: 1 } },
  text: "Prevent all damage that sources of the color of your choice would deal this turn.\nFlashback—Tap an untapped white creature you control. (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  effect: {
    kind: "modal",
    minModes: 1,
    maxModes: 1,
    modes: COLORS.map(([color, name]) => ({
      text: name,
      effect: { kind: "damage-rule", by: { filter: { colors: [color] } } },
    })),
  },
});
