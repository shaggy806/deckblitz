import { defineCard } from "../define.js";

export default defineCard({
  name: "Cabal Archon",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 2,
  text: "{B}, Sacrifice a Cleric: Target player loses 2 life and you gain 2 life.",
  activated: [
    {
      cost: { mana: "{B}", tap: false, sacrifice: { filter: { subtype: "Cleric" } } },
      targets: ["player"],
      effect: {
        kind: "sequence",
        effects: [{ kind: "lose-life", amount: 2, target: 0 }, { kind: "gain-life", amount: 2 }],
      },
      resolve: null,
      text: "{B}, Sacrifice a Cleric: Target player loses 2 life and you gain 2 life.",
    },
  ],
});
