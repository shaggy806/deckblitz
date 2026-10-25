import { defineCard } from "../define.js";

// Homelands (HML). EDHREC rank 24124.
//
// Rulings:
//   [2008-05-01] The -1/-1 counters that are put on the enchanted creature are independent of
//     Torture. If Torture leaves the battlefield or is moved to another creature, the counters
//     will stay put.

const PUT = "{1}{B}: Put a -1/-1 counter on enchanted creature.";

export default defineCard({
  name: "Torture",
  manaCost: "{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${PUT}`,
  targets: ["creature"],
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false },
      targets: [],
      effect: { kind: "add-counter", target: "attached", counter: "-1/-1", amount: 1 },
      resolve: null,
      text: PUT,
    },
  ],
});
