import { defineCard } from "../define.js";

export default defineCard({
  name: "Stoke the Flames",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["instant"],
  convoke: true,
  text: "Convoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one mana of that creature's color.)\nStoke the Flames deals 4 damage to any target.",
  targets: ["any-target"],
  effect: { kind: "damage", amount: 4, target: 0 },
});
