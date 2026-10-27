import { defineCard } from "../define.js";
import type { ModeOption } from "../../effects.js";
import type { Color } from "../../mana.js";

const FACES = ["Illusion // Reality", "Illusion", "Reality"];

// The left half of Illusion // Reality (see illusion-reality.ts). "The color of your choice":
// one colour, chosen as it resolves — one mode per colour (Alchor's Tomb's shape), Lifelace's
// spell-or-permanent target, until end of turn.
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
  name: "Illusion",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Target spell or permanent becomes the color of your choice until end of turn.",
  targets: [{ kind: "spell-or-permanent" }],
  effect: { kind: "modal", minModes: 1, maxModes: 1, modes: MODES },
  faces: FACES,
  split: true,
});
