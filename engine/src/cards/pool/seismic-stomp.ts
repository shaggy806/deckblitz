import { defineCard } from "../define.js";

// A rule for the turn (the `filter` form of `restrict`): creatures that lose flying or
// enter later can't block either (the ruling).
export default defineCard({
  name: "Seismic Stomp",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Creatures without flying can't block this turn.",
  targets: [],
  effect: { kind: "restrict", filter: { type: "creature", notKeyword: "flying" }, restrictions: ["cant-block"] },
});
