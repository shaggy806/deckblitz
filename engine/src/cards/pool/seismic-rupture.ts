import { defineCard } from "../define.js";

export default defineCard({
  name: "Seismic Rupture",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Seismic Rupture deals 2 damage to each creature without flying.",
  effect: { kind: "damage-all", filter: { type: "creature", notKeyword: "flying" }, amount: 2 },
});
