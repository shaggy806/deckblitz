import { defineCard } from "../define.js";

export default defineCard({
  name: "Sultai Runemark",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature gets +2/+2.\nEnchanted creature has deathtouch as long as you control a green or blue permanent. (Any amount of damage it deals to a creature is enough to destroy it.)",
  targets: ["creature"],
  static: [
    { affects: { scope: "attached" }, grantPt: [2, 2], text: "Enchanted creature gets +2/+2." },
    {
      affects: { scope: "attached" },
      condition: {
        kind: "controls",
        filter: { anyOf: [{ colors: ["G"] }, { colors: ["U"] }] },
        atLeast: 1,
        countsSelf: true,
      },
      grantKeywords: ["deathtouch"],
      text: "Enchanted creature has deathtouch as long as you control a green or blue permanent.",
    },
  ],
});
