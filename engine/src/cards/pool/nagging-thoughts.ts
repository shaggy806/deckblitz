import { defineCard } from "../define.js";

export default defineCard({
  name: "Nagging Thoughts",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["sorcery"],
  madness: { cost: "{1}{U}" },
  text: "Look at the top two cards of your library. Put one of them into your hand and the other into your graveyard.\nMadness {1}{U} (If you discard this card, discard it into exile. When you do, cast it for its madness cost or put it into your graveyard.)",
  effect: { kind: "look-and-choose", zone: "library", count: 2, min: 1, max: 1, destination: "hand", leftover: "graveyard" },
});
