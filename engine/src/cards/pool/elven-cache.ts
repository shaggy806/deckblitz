import { defineCard } from "../define.js";

// EDHREC rank 22864.

export default defineCard({
  name: "Elven Cache",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Return target card from your graveyard to your hand.",
  targets: [{ kind: "card-in-graveyard", whose: "you" }],
  effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
});
