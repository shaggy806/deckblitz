import type { ModeOption } from "../../effects.js";
import type { Color } from "../../mana.js";
import { defineCard } from "../define.js";

// EDHREC rank 14818.
//
// The colour is chosen as the ability resolves (it's not a modal ability —
// "the color of your choice" is a resolution choice, rule 608.2d), so each
// "mode" is one colour together with the +1/+1, as Caldera Kavu's is.

const TEXT = "Discard a card: This creature gets +1/+1 and becomes the color of your choice until end of turn.";

const COLORS: readonly (readonly [Color, string])[] = [
  ["W", "White"],
  ["U", "Blue"],
  ["B", "Black"],
  ["R", "Red"],
  ["G", "Green"],
];

const MODES: ModeOption[] = COLORS.map(([color, word]) => ({
  text: word,
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      { kind: "become-color", target: "source", colors: [color], duration: "end-of-turn" },
    ],
  },
}));

export default defineCard({
  name: "Wild Mongrel",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dog"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: false, discard: { count: 1 } },
      targets: [],
      effect: { kind: "modal", minModes: 1, maxModes: 1, modes: MODES },
      resolve: null,
      text: TEXT,
    },
  ],
});
