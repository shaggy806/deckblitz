import { defineCard } from "../define.js";

// EDHREC rank 18359. Torment.

export default defineCard({
  name: "Psychotic Haze",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["instant"],
  madness: { cost: "{1}{B}" },
  text: "Psychotic Haze deals 1 damage to each creature and each player.\nMadness {1}{B} (If you discard this card, discard it into exile. When you do, cast it for its madness cost or put it into your graveyard.)",
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "damage-all", filter: { type: "creature" }, amount: 1 },
      { kind: "damage", amount: 1, who: "each-player" },
    ],
  },
});
