import { defineCard } from "../define.js";

// Legends. EDHREC rank 27849.
//
// Rulings:
//   [2004-10-04] A creature is "enchanted" if it has any Auras attached to it.

export default defineCard({
  name: "Ramses Overdark",
  manaCost: "{2}{U}{U}{B}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Assassin"],
  power: 4,
  toughness: 3,
  text: "{T}: Destroy target enchanted creature.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", enchanted: true } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "{T}: Destroy target enchanted creature.",
    },
  ],
});
