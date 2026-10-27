import type { ModeOption } from "../../effects.js";
import type { Color } from "../../mana.js";
import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 30270.
//
// Rulings:
//   [2004-10-04] Counterspells can be cast that target it, but when they resolve they simply don't
//     counter it since it can't be countered.
//   [2004-10-04] The new color replaces all previous colors.
//
// Caldera Kavu's colour ability: the colour is chosen on resolution, as a
// `modal`, and `become-color` replaces every previous colour.
const COLOR = "{G}: This creature becomes the color of your choice until end of turn.";

const COLORS: readonly (readonly [Color, string])[] = [
  ["W", "White"],
  ["U", "Blue"],
  ["B", "Black"],
  ["R", "Red"],
  ["G", "Green"],
];

const MODES: ModeOption[] = COLORS.map(([color, word]) => ({
  text: word,
  effect: { kind: "become-color", target: "source", colors: [color], duration: "end-of-turn" },
}));

export default defineCard({
  name: "Kavu Chameleon",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Kavu"],
  power: 4,
  toughness: 4,
  cantBeCountered: true,
  text: `This spell can't be countered.\n${COLOR}`,
  activated: [
    {
      cost: { mana: "{G}", tap: false },
      targets: [],
      effect: { kind: "modal", minModes: 1, maxModes: 1, modes: MODES },
      resolve: null,
      text: COLOR,
    },
  ],
});
