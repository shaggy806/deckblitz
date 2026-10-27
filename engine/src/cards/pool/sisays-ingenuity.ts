import type { ModeOption } from "../../effects.js";
import type { Color } from "../../mana.js";
import { defineCard } from "../define.js";

// EDHREC rank 23623.

const GRANTED = "{2}{U}: Target creature becomes the color of your choice until end of turn.";

const COLORS: readonly (readonly [Color, string])[] = [
  ["W", "White"],
  ["U", "Blue"],
  ["B", "Black"],
  ["R", "Red"],
  ["G", "Green"],
];

// The colour is chosen as the ability resolves.
const MODES: ModeOption[] = COLORS.map(([color, word]) => ({
  text: word,
  effect: { kind: "become-color", target: 0, colors: [color], duration: "end-of-turn" },
}));

export default defineCard({
  name: "Sisay's Ingenuity",
  manaCost: "{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nWhen this Aura enters, draw a card.\nEnchanted creature has "${GRANTED}"`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "When this Aura enters, draw a card.",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantsActivated: [
        {
          cost: { mana: "{2}{U}", tap: false },
          targets: ["creature"],
          effect: { kind: "modal", minModes: 1, maxModes: 1, modes: MODES },
          resolve: null,
          text: GRANTED,
        },
      ],
      text: `Enchanted creature has "${GRANTED}"`,
    },
  ],
});
