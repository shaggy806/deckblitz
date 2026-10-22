import { defineCard } from "../define.js";

// Rulings:
//   [2006-10-15] Can target a creature with snow islandwalk. (The engine has
//     no snow islandwalk keyword, so no creature can have one.)
export default defineCard({
  name: "Merfolk Assassin",
  manaCost: "{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Assassin"],
  power: 1,
  toughness: 2,
  text: "{T}: Destroy target creature with islandwalk.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", keyword: "islandwalk" } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "{T}: Destroy target creature with islandwalk.",
    },
  ],
});
