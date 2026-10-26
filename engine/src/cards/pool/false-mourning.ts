import { defineCard } from "../define.js";

// Urza's Destiny. EDHREC rank 27643.

export default defineCard({
  name: "False Mourning",
  manaCost: "{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Put target card from your graveyard on top of your library.",
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: {} }],
  effect: { kind: "put-on-library", target: 0, position: "top" },
});
