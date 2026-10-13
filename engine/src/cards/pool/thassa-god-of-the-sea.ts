import { defineCard } from "../define.js";

// EDHREC rank 1968.

export default defineCard({
  name: "Thassa, God of the Sea",
  manaCost: "{2}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["enchantment", "creature"],
  subtypes: ["God"],
  power: 5,
  toughness: 5,
  keywords: ["indestructible"],
  text: "Indestructible\nAs long as your devotion to blue is less than five, Thassa isn't a creature. (Each {U} in the mana costs of permanents you control counts toward your devotion to blue.)\nAt the beginning of your upkeep, scry 1.\n{1}{U}: Target creature you control can't be blocked this turn.",
  activated: [
    {
      cost: { mana: "{1}{U}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
      resolve: null,
      text: "{1}{U}: Target creature you control can't be blocked this turn.",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "scry", amount: 1 },
      resolve: null,
      text: "At the beginning of your upkeep, scry 1.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "devotion", colors: ["U"], atMost: 4 },
      removeTypes: ["creature"],
      text: "As long as your devotion to blue is less than five, Thassa isn't a creature.",
    },
  ],
});
