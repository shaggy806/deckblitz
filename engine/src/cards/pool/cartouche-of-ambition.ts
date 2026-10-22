import { defineCard } from "../define.js";

// EDHREC rank 15629.

export default defineCard({
  name: "Cartouche of Ambition",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura", "Cartouche"],
  text: "Enchant creature you control\nWhen this Aura enters, you may put a -1/-1 counter on target creature.\nEnchanted creature gets +1/+1 and has lifelink.",
  targets: ["creature-you-control"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: {
        kind: "may",
        prompt: "Put a -1/-1 counter on target creature?",
        effect: { kind: "add-counter", target: 0, counter: "-1/-1", amount: 1 },
      },
      resolve: null,
      text: "When this Aura enters, you may put a -1/-1 counter on target creature.",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 1],
      grantKeywords: ["lifelink"],
      text: "Enchanted creature gets +1/+1 and has lifelink.",
    },
  ],
});
