import { defineCard } from "../define.js";

// Rulings:
//   [2008-04-01] The +1/+1 counters that are put on the enchanted creature are independent of
//     Daily Regimen. If Daily Regimen leaves the battlefield or is moved to another creature, the
//     counters will stay put.

export default defineCard({
  name: "Daily Regimen",
  manaCost: "{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\n{1}{W}: Put a +1/+1 counter on enchanted creature.",
  targets: ["creature"],
  activated: [
    {
      cost: { mana: "{1}{W}", tap: false },
      targets: [],
      effect: { kind: "add-counter", target: "attached", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "{1}{W}: Put a +1/+1 counter on enchanted creature.",
    },
  ],
});
