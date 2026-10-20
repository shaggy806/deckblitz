import { defineCard } from "../define.js";

export default defineCard({
  name: "Terminal Agony",
  manaCost: "{2}{B}{R}",
  colors: ["B", "R"],
  types: ["sorcery"],
  madness: { cost: "{B}{R}" },
  text: "Destroy target creature.\nMadness {B}{R} (If you discard this card, discard it into exile. When you do, cast it for its madness cost or put it into your graveyard.)",
  targets: ["creature"],
  effect: { kind: "destroy", target: 0 },
});
