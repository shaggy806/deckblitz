import { defineCard } from "../define.js";

export default defineCard({
  name: "Shielding Plax",
  manaCost: "{2}{G/U}",
  colors: ["G", "U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "({G/U} can be paid with either {G} or {U}.)\nEnchant creature\nWhen this Aura enters, draw a card.\nEnchanted creature can't be the target of spells or abilities your opponents control.",
  targets: ["creature"],
  triggered: [
    { trigger: { on: "enters-battlefield", who: "self" }, targets: [], effect: { kind: "draw", amount: 1 }, resolve: null, text: "When this Aura enters, draw a card." },
  ],
  static: [
    {
      affects: { scope: "self" },
      prohibits: [{ act: "be-targeted", object: { hostOfSource: true }, by: "opponents" }],
      text: "Enchanted creature can't be the target of spells or abilities your opponents control.",
    },
  ],
});
