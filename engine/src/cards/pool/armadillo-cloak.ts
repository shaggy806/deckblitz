import { defineCard } from "../define.js";

// "Whenever enchanted creature deals damage" triggers once per damage event,
// however many things it was dealt to at once — a trampler's blocker and
// player, two blockers — "that much" the total (rule 603.2c, Armadillo
// Cloak's ruling). It isn't lifelink: the Aura's controller gains the life,
// on the stack (the rulings).
const LIFE_TEXT = "Whenever enchanted creature deals damage, you gain that much life.";

export default defineCard({
  name: "Armadillo Cloak",
  manaCost: "{1}{G}{W}",
  colors: ["G", "W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nEnchanted creature gets +2/+2 and has trample.\n${LIFE_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, 2],
      grantKeywords: ["trample"],
      text: "Enchanted creature gets +2/+2 and has trample.",
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-damage", who: "attached" },
      targets: [],
      effect: { kind: "gain-life", amount: { triggerValue: true } },
      resolve: null,
      text: LIFE_TEXT,
    },
  ],
});
