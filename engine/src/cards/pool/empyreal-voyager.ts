import { defineCard } from "../define.js";

// EDHREC rank 18817.

const TEXT = "Whenever this creature deals combat damage to a player, you get that many {E} (energy counters).";

export default defineCard({
  name: "Empyreal Voyager",
  manaCost: "{1}{G}{U}",
  colors: ["U", "G"],
  types: ["creature"],
  subtypes: ["Vedalken", "Scout"],
  power: 2,
  toughness: 3,
  keywords: ["flying", "trample"],
  text: `Flying, trample\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "get-energy", amount: { triggerValue: true } },
      resolve: null,
      text: TEXT,
    },
  ],
});
