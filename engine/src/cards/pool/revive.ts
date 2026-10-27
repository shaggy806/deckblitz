import { defineCard } from "../define.js";

// EDHREC rank 12710.

export default defineCard({
  name: "Revive",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Return target green card from your graveyard to your hand.",
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: { colors: ["G"] } }],
  effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
});
