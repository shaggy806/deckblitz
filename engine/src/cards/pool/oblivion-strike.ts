import { defineCard } from "../define.js";

export default defineCard({
  name: "Oblivion Strike",
  manaCost: "{3}{B}",
  colors: [],
  types: ["sorcery"],
  text: "Devoid (This card has no color.)\nExile target creature.",
  targets: ["creature"],
  effect: { kind: "exile", target: 0 },
});
