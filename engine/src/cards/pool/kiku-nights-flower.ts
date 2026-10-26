import { defineCard } from "../define.js";

export default defineCard({
  name: "Kiku, Night's Flower",
  manaCost: "{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Assassin"],
  power: 1,
  toughness: 1,
  text: "{2}{B}{B}, {T}: Target creature deals damage to itself equal to its power.",
  activated: [
    {
      cost: { mana: "{2}{B}{B}", tap: true },
      targets: ["creature"],
      effect: { kind: "damage", amount: { powerOf: 0 }, target: 0, from: { target: 0 } },
      resolve: null,
      text: "{2}{B}{B}, {T}: Target creature deals damage to itself equal to its power.",
    },
  ],
});
