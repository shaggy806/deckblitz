import { defineCard } from "../define.js";

export default defineCard({
  name: "Into the Fray",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  subtypes: ["Arcane"],
  text: "Target creature attacks this turn if able.\nSplice onto Arcane {R} (As you cast an Arcane spell, you may reveal this card from your hand and pay its splice cost. If you do, add this card's effects to that spell.)",
  splice: { onto: "arcane", cost: "{R}" },
  targets: ["creature"],
  effect: { kind: "restrict", target: 0, restrictions: ["must-attack"] },
});
