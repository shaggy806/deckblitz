import { defineCard } from "../define.js";

const TAPPED =
  "Whenever enchanted creature becomes tapped, this Aura deals 3 damage to that creature's controller.";
const ATTACKS = "Enchanted creature attacks each combat if able.";

// Ruling: it triggers whenever the creature becomes tapped for any reason.
export default defineCard({
  name: "Lust for War",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TAPPED}\n${ATTACKS}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "attached" },
      targets: [],
      effect: { kind: "damage", amount: 3, who: "trigger-controller" },
      resolve: null,
      text: TAPPED,
    },
  ],
  static: [{ affects: { scope: "attached" }, restrictions: ["must-attack"], text: ATTACKS }],
});
