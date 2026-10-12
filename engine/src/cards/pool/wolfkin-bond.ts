import { defineCard } from "../define.js";

export default defineCard({
  name: "Wolfkin Bond",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nWhen this Aura enters, create a 2/2 green Wolf creature token.\nEnchanted creature gets +2/+2.",
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Wolf Token", count: 1 },
      resolve: null,
      text: "When this Aura enters, create a 2/2 green Wolf creature token.",
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [2, 2], text: "Enchanted creature gets +2/+2." }],
});
