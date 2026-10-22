import { defineCard } from "../define.js";

const RESTRICTION_TEXT = "Bontu can't attack or block unless a creature died under your control this turn.";
const SAC_TEXT = "{1}{B}, Sacrifice another creature: Scry 1. Each opponent loses 1 life and you gain 1 life.";

export default defineCard({
  name: "Bontu the Glorified",
  manaCost: "{2}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["God"],
  power: 4,
  toughness: 6,
  keywords: ["menace", "indestructible"],
  text: `Menace, indestructible\n${RESTRICTION_TEXT}\n${SAC_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: {
        kind: "not",
        of: { kind: "turn-history", what: "died", who: "you", filter: { type: "creature" } },
      },
      restrictions: ["cant-attack", "cant-block"],
      text: RESTRICTION_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false, sacrifice: "creature-you-control" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "scry", amount: 1 },
          { kind: "lose-life", amount: 1, who: "each-opponent" },
          { kind: "gain-life", amount: 1 },
        ],
      },
      resolve: null,
      text: SAC_TEXT,
      otherOnly: true,
    },
  ],
});
