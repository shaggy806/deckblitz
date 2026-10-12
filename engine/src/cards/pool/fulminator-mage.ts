import { defineCard } from "../define.js";

export default defineCard({
  name: "Fulminator Mage",
  manaCost: "{1}{B/R}{B/R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Elemental", "Shaman"],
  power: 2,
  toughness: 2,
  text: "Sacrifice this creature: Destroy target nonbasic land.",
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: [{ kind: "permanent", filter: { notSupertype: "basic", type: "land" } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "Sacrifice this creature: Destroy target nonbasic land.",
    },
  ],
});
