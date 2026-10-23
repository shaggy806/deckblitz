import { defineCard } from "../define.js";

export default defineCard({
  name: "Airborne Aid",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Draw a card for each Bird on the battlefield.",
  targets: [],
  // Every Bird, whoever controls it.
  effect: { kind: "draw", amount: { countOf: { subtype: "Bird" } } },
});
