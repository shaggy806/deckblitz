import { defineCard } from "../define.js";

export default defineCard({
  name: "Tamiyo's Epiphany",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Scry 4, then draw two cards.",
  targets: [],
  effect: { kind: "scry", amount: 4, then: { kind: "draw", amount: 2 } },
});
