import { defineCard } from "../define.js";

// EDHREC rank 19242.
export default defineCard({
  name: "Whipflare",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Whipflare deals 2 damage to each nonartifact creature.",
  targets: [],
  effect: { kind: "damage-all", filter: { type: "creature", notTypes: ["artifact"] }, amount: 2 },
});
