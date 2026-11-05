import { defineCard } from "../define.js";


export default defineCard({
  name: "Strange Inversion",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  subtypes: ["Arcane"],
  splice: { onto: "arcane", cost: "{1}{R}" },
  text: "Switch target creature's power and toughness until end of turn.\nSplice onto Arcane {1}{R} (As you cast an Arcane spell, you may reveal this card from your hand and pay its splice cost. If you do, add this card's effects to that spell.)",
  targets: ["creature"],
  effect: { kind: "switch-pt", target: 0, duration: "end-of-turn" },
});
