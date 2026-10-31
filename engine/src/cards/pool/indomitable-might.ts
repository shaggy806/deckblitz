import { defineCard } from "../define.js";

const PT_TEXT = "Enchanted creature gets +3/+3.";
const ASSIGN_TEXT =
  "Enchanted creature's controller may have it assign its combat damage as though it weren't blocked.";

// A rule from the Aura about how the creature assigns damage, not an ability
// it gains: a loss of the creature's abilities leaves it.
export default defineCard({
  name: "Indomitable Might",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["flash"],
  text: `Flash\nEnchant creature\n${PT_TEXT}\n${ASSIGN_TEXT}`,
  targets: ["creature"],
  static: [
    { affects: { scope: "attached" }, grantPt: [3, 3], text: PT_TEXT },
    { affects: { scope: "attached" }, assignAsThoughUnblocked: true, text: ASSIGN_TEXT },
  ],
});
