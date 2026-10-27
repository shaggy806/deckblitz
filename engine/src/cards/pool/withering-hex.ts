import { defineCard } from "../define.js";

// Onslaught. EDHREC rank 31015. Stoic Champion's "a player cycles" trigger
// feeding Endless Scream's per-counter bonus, in plague counters.

const CYCLE_TEXT = "Whenever a player cycles a card, put a plague counter on this Aura.";
const SHRINK_TEXT = "Enchanted creature gets -1/-1 for each plague counter on this Aura.";

export default defineCard({
  name: "Withering Hex",
  manaCost: "{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${CYCLE_TEXT}\n${SHRINK_TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "cycles", who: "any" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "plague", amount: 1 },
      resolve: null,
      text: CYCLE_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPtPerCount: { countersOnSource: "plague", pt: [-1, -1] },
      text: SHRINK_TEXT,
    },
  ],
});
