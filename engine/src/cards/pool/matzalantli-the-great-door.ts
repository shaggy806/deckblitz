import { defineCard } from "../define.js";

// EDHREC rank 1814.
//
// Rulings:
//   [2023-11-10] Transforming Matzalantli doesn't cause it to leave the battlefield. It also
//     doesn't cause it to become untapped.

export default defineCard({
  name: "Matzalantli, the Great Door",
  manaCost: "{3}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  text: "{T}: Draw a card, then discard a card.\n{4}, {T}: Transform Matzalantli. Activate only if there are four or more permanent types among cards in your graveyard. (Artifact, battle, creature, enchantment, land, and planeswalker are permanent types.)",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [{ kind: "draw", amount: 1 }, { kind: "discard", target: "you", amount: 1 }],
      },
      resolve: null,
      text: "{T}: Draw a card, then discard a card.",
    },
    {
      cost: { mana: "{4}", tap: true },
      condition: {
        kind: "aggregate",
        value: { aggregate: "distinct", of: "permanent-type", filter: { ownedBy: "you" }, in: "graveyards" },
        compare: { op: "gte", n: 4 },
      },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: "{4}, {T}: Transform Matzalantli. Activate only if there are four or more permanent types among cards in your graveyard.",
    },
  ],
  faces: ["Matzalantli, the Great Door", "The Core"],
  transform: true,
});
