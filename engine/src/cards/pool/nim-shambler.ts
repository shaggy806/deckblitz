import { defineCard } from "../define.js";

export default defineCard({
  name: "Nim Shambler",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 2,
  toughness: 1,
  text: "This creature gets +1/+0 for each artifact you control.\nSacrifice a creature: Regenerate this creature.",
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { filter: { type: "artifact", controlledBy: "you" }, pt: [1, 0] },
      text: "This creature gets +1/+0 for each artifact you control.",
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: { filter: { type: "creature" } } },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "Sacrifice a creature: Regenerate this creature.",
    },
  ],
});
