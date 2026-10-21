import { defineCard } from "../define.js";

export default defineCard({
  name: "Military Discipline",
  manaCost: "{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["flash"],
  text: "Flash\nEnchant creature\nWhen this Aura enters, enchanted creature gains first strike until end of turn.\nEnchanted creature gets +1/+0.",
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "grant-keyword",
        target: "attached",
        keyword: "first-strike",
        duration: "end-of-turn",
      },
      resolve: null,
      text: "When this Aura enters, enchanted creature gains first strike until end of turn.",
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [1, 0], text: "Enchanted creature gets +1/+0." }],
});
