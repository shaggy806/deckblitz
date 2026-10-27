import type { ModeOption } from "../../effects.js";
import type { Color } from "../../mana.js";
import { defineCard } from "../define.js";

const PUMP = "{1}{B}: This creature gets +1/+1 until end of turn.";
// The colour is chosen on resolution (the ruling) — a `modal` is chosen then.
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
  name: "Caldera Kavu",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Kavu"],
  power: 2,
  toughness: 2,
  text: `${PUMP}\n${COLOR}`,
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: PUMP,
    },
    {
      cost: { mana: "{G}", tap: false },
      targets: [],
      effect: { kind: "modal", minModes: 1, maxModes: 1, modes: MODES },
      resolve: null,
      text: COLOR,
    },
  ],
});
