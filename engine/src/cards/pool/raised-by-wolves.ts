import { defineCard } from "../define.js";

export default defineCard({
  name: "Raised by Wolves",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nWhen this Aura enters, create two 2/2 green Wolf creature tokens.\nEnchanted creature gets +1/+1 for each Wolf you control.",
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Wolf Token", count: 2 },
      resolve: null,
      text: "When this Aura enters, create two 2/2 green Wolf creature tokens.",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPtPerCount: { filter: { subtype: "Wolf", controlledBy: "you" }, pt: [1, 1] },
      text: "Enchanted creature gets +1/+1 for each Wolf you control.",
    },
  ],
});
