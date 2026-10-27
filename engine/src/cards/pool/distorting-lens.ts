import { defineCard } from "../define.js";
import type { ModeOption } from "../../effects.js";
import type { Color } from "../../mana.js";

// EDHREC rank 15371. "The color of your choice": one
// colour, chosen as it resolves — one mode per colour (Illusion's shape).

const TEXT = "{T}: Target permanent becomes the color of your choice until end of turn.";
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
  name: "Distorting Lens",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: {} }],
      resolve: null,
      effect: { kind: "modal", minModes: 1, maxModes: 1, modes: MODES },
      text: TEXT,
    },
  ],
});
