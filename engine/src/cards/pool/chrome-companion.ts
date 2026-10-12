import { defineCard } from "../define.js";

// EDHREC rank 9923.

export default defineCard({
  name: "Chrome Companion",
  manaCost: "{2}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Dog"],
  power: 2,
  toughness: 1,
  text: "Whenever this creature becomes tapped, you gain 1 life.\n{2}, {T}: Put target card from a graveyard on the bottom of its owner's library.",
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: 1 },
      resolve: null,
      text: "Whenever this creature becomes tapped, you gain 1 life.",
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: [{ kind: "card-in-graveyard", whose: "any" }],
      effect: { kind: "put-on-library", target: 0, position: "bottom" },
      resolve: null,
      text: "{2}, {T}: Put target card from a graveyard on the bottom of its owner's library.",
    },
  ],
});
