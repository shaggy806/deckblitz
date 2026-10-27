import { defineCard } from "../define.js";

// Planeshift (PLS). EDHREC rank 29467.
//
// Lust for War's trigger, for 2. Ruling: it triggers however the creature
// becomes tapped, and not on entering attached to an already tapped one.

const TAPPED = "Whenever enchanted creature becomes tapped, this Aura deals 2 damage to that creature's controller.";

export default defineCard({
  name: "Insolence",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TAPPED}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "attached" },
      targets: [],
      effect: { kind: "damage", amount: 2, who: "trigger-controller" },
      resolve: null,
      text: TAPPED,
    },
  ],
});
