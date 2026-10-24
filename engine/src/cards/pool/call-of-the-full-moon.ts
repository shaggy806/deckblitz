import { defineCard } from "../define.js";

// EDHREC rank 26666.

export default defineCard({
  name: "Call of the Full Moon",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature gets +3/+2 and has trample. (It can deal excess combat damage to the player or planeswalker it's attacking.)\nAt the beginning of each upkeep, if a player cast two or more spells last turn, sacrifice this Aura.",
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: "At the beginning of each upkeep, if a player cast two or more spells last turn, sacrifice this Aura.",
      condition: { kind: "spells-cast-last-turn", byOnePlayerAtLeast: 2 },
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [3, 2],
      grantKeywords: ["trample"],
      text: "Enchanted creature gets +3/+2 and has trample.",
    },
  ],
});
