import { defineCard } from "../define.js";

// EDHREC rank 10918. Return to Ravnica.

export default defineCard({
  name: "Treasured Find",
  manaCost: "{B}{G}",
  colors: ["B", "G"],
  types: ["sorcery"],
  text: "Return target card from your graveyard to your hand. Exile Treasured Find.",
  targets: [{ kind: "card-in-graveyard", whose: "you" }],
  effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
  exileOnResolve: true,
});
