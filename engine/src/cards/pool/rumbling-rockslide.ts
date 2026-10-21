import { defineCard } from "../define.js";

// EDHREC rank 17570. Ikoria: Lair of Behemoths.

export default defineCard({
  name: "Rumbling Rockslide",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Rumbling Rockslide deals damage to target creature equal to the number of lands you control.",
  targets: ["creature"],
  effect: { kind: "damage", target: 0, amount: { countOf: { type: "land", controlledBy: "you" } } },
});
