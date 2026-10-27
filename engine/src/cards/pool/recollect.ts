import { defineCard } from "../define.js";

// EDHREC rank 13600.

export default defineCard({
  name: "Recollect",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Return target card from your graveyard to your hand.",
  targets: [{ kind: "card-in-graveyard", whose: "you" }],
  effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
});
