import type { ModeOption } from "../../effects.js";
import type { Color } from "../../mana.js";
import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 23544.

const COLORS: readonly (readonly [Color, string])[] = [
  ["W", "White"],
  ["U", "Blue"],
  ["B", "Black"],
  ["R", "Red"],
  ["G", "Green"],
];

// The colour is chosen as the spell resolves, then the hand is revealed and
// a card of that colour chosen from it (none there: nothing is discarded).
const MODES: ModeOption[] = COLORS.map(([color, word]) => ({
  text: word,
  effect: { kind: "discard-chosen", target: 0, filter: { colors: [color] } },
}));

export default defineCard({
  name: "Addle",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Choose a color. Target player reveals their hand and you choose a card of that color from it. That player discards that card.",
  targets: ["player"],
  effect: { kind: "modal", minModes: 1, maxModes: 1, modes: MODES },
});
