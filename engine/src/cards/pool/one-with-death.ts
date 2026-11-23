import { defineCard } from "../define.js";

// Playtest card (Mystery Booster 2). No target, so nothing can redirect the
// loss to another player (the ruling): its controller loses.

export default defineCard({
  name: "One with Death",
  manaCost: "{B}",
  colors: ["B"],
  types: ["instant"],
  text: "You lose the game.",
  targets: [],
  effect: { kind: "lose-game" },
});
