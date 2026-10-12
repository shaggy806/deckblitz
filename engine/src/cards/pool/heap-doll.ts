import { defineCard } from "../define.js";

export default defineCard({
  name: "Heap Doll",
  manaCost: "{1}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Scarecrow"],
  power: 1,
  toughness: 1,
  text: "Sacrifice this creature: Exile target card from a graveyard.",
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "any" }],
      effect: { kind: "exile", target: 0 },
      resolve: null,
      text: "Sacrifice this creature: Exile target card from a graveyard.",
    },
  ],
});
