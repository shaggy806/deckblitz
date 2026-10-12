import { defineCard } from "../define.js";

export default defineCard({
  name: "Crypt Creeper",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 2,
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
