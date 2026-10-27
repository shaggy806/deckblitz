import type { ModeOption } from "../../effects.js";
import type { Color } from "../../mana.js";
import { defineCard } from "../define.js";

// The colour is chosen as the ability resolves — a `modal` is chosen then.
const TEXT = "{2}{G}, {T}, Sacrifice this creature: Destroy all enchantments of the color of your choice.";

const COLORS: readonly (readonly [Color, string])[] = [
  ["W", "White"],
  ["U", "Blue"],
  ["B", "Black"],
  ["R", "Red"],
  ["G", "Green"],
];

const MODES: ModeOption[] = COLORS.map(([color, word]) => ({
  text: word,
  effect: { kind: "destroy-all", filter: { type: "enchantment", colors: [color] } },
}));

export default defineCard({
  name: "Root Greevil",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 2,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}{G}", tap: true, sacrifice: "self" },
      targets: [],
      effect: { kind: "modal", minModes: 1, maxModes: 1, modes: MODES },
      resolve: null,
      text: TEXT,
    },
  ],
});
