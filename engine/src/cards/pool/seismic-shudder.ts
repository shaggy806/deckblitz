import { defineCard } from "../define.js";

export default defineCard({
  name: "Seismic Shudder",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Seismic Shudder deals 1 damage to each creature without flying.",
  effect: { kind: "damage-all", filter: { type: "creature", notKeyword: "flying" }, amount: 1 },
});
