import { defineCard } from "../define.js";

// EDHREC rank 20104.

export default defineCard({
  name: "Thunderous Wrath",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Thunderous Wrath deals 5 damage to any target.\nMiracle {R} (You may cast this card for its miracle cost when you draw it if it's the first card you drew this turn.)",
  miracle: { cost: "{R}" },
  targets: ["any-target"],
  effect: { kind: "damage", amount: 5, target: 0 },
});
