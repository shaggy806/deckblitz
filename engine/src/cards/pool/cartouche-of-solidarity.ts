import { defineCard } from "../define.js";

export default defineCard({
  name: "Cartouche of Solidarity",
  manaCost: "{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura", "Cartouche"],
  text: "Enchant creature you control\nWhen this Aura enters, create a 1/1 white Warrior creature token with vigilance.\nEnchanted creature gets +1/+1 and has first strike. (It deals combat damage before creatures without first strike.)",
  targets: ["creature-you-control"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Warrior Token (Vigilance)", count: 1 },
      resolve: null,
      text: "When this Aura enters, create a 1/1 white Warrior creature token with vigilance.",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 1],
      grantKeywords: ["first-strike"],
      text: "Enchanted creature gets +1/+1 and has first strike.",
    },
  ],
});
