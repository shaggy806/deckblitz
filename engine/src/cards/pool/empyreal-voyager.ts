import { defineCard } from "../define.js";

// Kaladesh. EDHREC rank 18817. Peema Trailblazer's "that many {E}".
const DAMAGE_TEXT = "Whenever this creature deals combat damage to a player, you get that many {E} (energy counters).";

export default defineCard({
  name: "Empyreal Voyager",
  manaCost: "{1}{G}{U}",
  colors: ["G", "U"],
  types: ["creature"],
  subtypes: ["Vedalken", "Scout"],
  power: 2,
  toughness: 3,
  keywords: ["flying", "trample"],
  text: `Flying, trample\n${DAMAGE_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "get-energy", amount: { triggerValue: true } },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
