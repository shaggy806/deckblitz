import { defineCard } from "../define.js";

// "Enchanted creature" is the `"attached"` reference: the one it enchants as
// the trigger resolves, or the one it last enchanted (its ruling).
const ENTERS = "When this Aura enters, enchanted creature gains first strike until end of turn.";

export default defineCard({
  name: "Aspect of Manticore",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["flash"],
  text: `Flash\nEnchant creature\n${ENTERS}\nEnchanted creature gets +2/+0.`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "grant-keyword", target: "attached", keyword: "first-strike", duration: "end-of-turn" },
      resolve: null,
      text: ENTERS,
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [2, 0], text: "Enchanted creature gets +2/+0." }],
});
