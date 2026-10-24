import { defineCard } from "../define.js";

export default defineCard({
  name: "Alchemist's Greeting",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["sorcery"],
  madness: { cost: "{1}{R}" },
  text: "Alchemist's Greeting deals 4 damage to target creature.\nMadness {1}{R} (If you discard this card, discard it into exile. When you do, cast it for its madness cost or put it into your graveyard.)",
  targets: ["creature"],
  effect: { kind: "damage", amount: 4, target: 0 },
});
