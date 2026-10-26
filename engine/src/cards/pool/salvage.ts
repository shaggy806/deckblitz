import { defineCard } from "../define.js";

// EDHREC rank 22380. Reclaim's text and shape.

export default defineCard({
  name: "Salvage",
  manaCost: "{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Put target card from your graveyard on top of your library.",
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: {} }],
  effect: { kind: "put-on-library", target: 0, position: "top" },
});
