import { defineCard } from "../define.js";

// Urza's Saga (USG). EDHREC rank 21637.

export default defineCard({
  name: "Falter",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Creatures without flying can't block this turn.",
  targets: [],
  effect: { kind: "restrict", filter: { type: "creature", notKeyword: "flying" }, restrictions: ["cant-block"] },
});
