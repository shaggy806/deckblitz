import { defineCard } from "../define.js";
import type { ModeOption } from "../../effects.js";
import type { Color } from "../../mana.js";

// Eventide (EVE). EDHREC rank 30470.
//
// Rulings:
//   You can choose any color or combination of colors. You can't choose colorless.
//
// Prismatic Lace's shape: the colours are chosen as the ability resolves, one mode for each
// of the 31 non-empty combinations of the five colours (never colourless), until end of turn.
const COLORS: readonly (readonly [Color, string])[] = [
  ["W", "White"],
  ["U", "Blue"],
  ["B", "Black"],
  ["R", "Red"],
  ["G", "Green"],
];

const MODES: ModeOption[] = Array.from({ length: 31 }, (_, i) => i + 1)
  .map((mask) => COLORS.filter((_, bit) => (mask & (1 << bit)) !== 0))
  .sort((x, y) => x.length - y.length)
  .map((picked) => ({
    text: picked.map(([, word]) => word).join(", "),
    effect: { kind: "become-color", target: 0, colors: picked.map(([color]) => color), duration: "end-of-turn" },
  }));

export default defineCard({
  name: "Swirling Spriggan",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Goblin", "Shaman"],
  power: 3,
  toughness: 3,
  text: "{G/U}{G/U}: Target creature you control becomes the color or colors of your choice until end of turn.",
  activated: [
    {
      cost: { mana: "{G/U}{G/U}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "modal", minModes: 1, maxModes: 1, modes: MODES },
      resolve: null,
      text: "{G/U}{G/U}: Target creature you control becomes the color or colors of your choice until end of turn.",
    },
  ],
});
