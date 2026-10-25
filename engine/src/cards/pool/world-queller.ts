import { defineCard } from "../define.js";
import type { CardType } from "../define.js";

// EDHREC rank 21358.
//
// The card type is chosen as the trigger resolves (the ruling): a modal of
// zero or one mode. Only the seven permanent types are offered — choosing any
// other card type sacrifices nothing (the ruling), the same as choosing none.
// Each player then sacrifices one permanent of that type of their choice, all
// at once (the ruling).

const TEXT =
  "At the beginning of your upkeep, you may choose a card type. If you do, each player sacrifices a permanent of their choice of that type.";

const PERMANENT_TYPES: readonly CardType[] = [
  "artifact",
  "battle",
  "creature",
  "enchantment",
  "kindred",
  "land",
  "planeswalker",
];

const label = (type: CardType): string => type.charAt(0).toUpperCase() + type.slice(1);

export default defineCard({
  name: "World Queller",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Avatar"],
  power: 4,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "modal",
        minModes: 0,
        maxModes: 1,
        modes: PERMANENT_TYPES.map((type) => ({
          text: `${label(type)}: each player sacrifices ${type === "artifact" || type === "enchantment" ? "an" : "a"} ${type}.`,
          effect: { kind: "sacrifice", who: "each-player", filter: { type }, count: 1 },
        })),
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
