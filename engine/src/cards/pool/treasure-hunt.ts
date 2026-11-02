import { defineCard } from "../define.js";

export default defineCard({
  name: "Treasure Hunt",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Reveal cards from the top of your library until you reveal a nonland card, then put all cards revealed this way into your hand.",
  targets: [],
  effect: { kind: "reveal-until", filter: { notTypes: ["land"] }, rest: "hand" },
});
