import { defineCard } from "../define.js";

export default defineCard({
  name: "Incorrigible Youths",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 4,
  toughness: 3,
  keywords: ["haste"],
  madness: { cost: "{2}{R}" },
  text: "Haste (This creature can attack and {T} as soon as it comes under your control.)\nMadness {2}{R} (If you discard this card, discard it into exile. When you do, cast it for its madness cost or put it into your graveyard.)",
});
