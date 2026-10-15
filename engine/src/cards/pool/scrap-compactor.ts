import { defineCard } from "../define.js";

// EDHREC rank 21674. Barrels of Blasting Jelly's and Urn of Godfire's shapes:
// "it" is the sacrificed artifact, dealing the damage as it last existed.

export default defineCard({
  name: "Scrap Compactor",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: "{3}, {T}, Sacrifice this artifact: It deals 3 damage to target creature.\n{6}, {T}, Sacrifice this artifact: Destroy target creature or Vehicle.",
  activated: [
    {
      cost: { mana: "{3}", tap: true, sacrifice: "self" },
      targets: ["creature"],
      effect: { kind: "damage", target: 0, amount: 3 },
      resolve: null,
      text: "{3}, {T}, Sacrifice this artifact: It deals 3 damage to target creature.",
    },
    {
      cost: { mana: "{6}", tap: true, sacrifice: "self" },
      targets: [{ kind: "permanent", filter: { anyOf: [{ type: "creature" }, { subtype: "Vehicle" }] } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "{6}, {T}, Sacrifice this artifact: Destroy target creature or Vehicle.",
    },
  ],
});
