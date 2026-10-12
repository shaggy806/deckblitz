import { defineCard } from "../define.js";

export default defineCard({
  name: "Sewerdreg",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 3,
  toughness: 3,
  keywords: ["swampwalk"],
  text: "Swampwalk (This creature can't be blocked as long as defending player controls a Swamp.)\nSacrifice this creature: Exile target card from a graveyard.",
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
