import type { ModeOption } from "../../effects.js";
import type { Color } from "../../mana.js";
import { defineCard } from "../define.js";

// EDHREC rank 19337.
// The colour is chosen as the ability resolves (rule 608.2d), one choice for
// both halves.
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
      { kind: "become-color", target: "source", colors: [color], duration: "end-of-turn" },
      { kind: "grant-protection", asHexproof: true, target: "source", from: { colors: [color] }, duration: "end-of-turn" },
    ],
  },
}));

export default defineCard({
  name: "Mondo Gecko",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Lizard", "Mutant"],
  power: 2,
  toughness: 3,
  text: "{1}, Discard a card: Until end of turn, Mondo Gecko becomes the color of your choice and gains hexproof from that color.\nWhenever Mondo Gecko deals combat damage to a player, draw a card for each color among permanents you control.",
  activated: [
    {
      cost: { mana: "{1}", tap: false, discard: { count: 1 } },
      targets: [],
      effect: { kind: "modal", minModes: 1, maxModes: 1, modes: MODES },
      resolve: null,
      text: "{1}, Discard a card: Until end of turn, Mondo Gecko becomes the color of your choice and gains hexproof from that color.",
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: { colorsAmong: { controlledBy: "you" } } },
      resolve: null,
      text: "Whenever Mondo Gecko deals combat damage to a player, draw a card for each color among permanents you control.",
    },
  ],
});
