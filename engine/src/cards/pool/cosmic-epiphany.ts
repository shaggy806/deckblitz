import { defineCard } from "../define.js";

// Dominaria United (DMU). EDHREC rank 15249.
//
// Counted as it resolves, while the spell is still on the stack — it doesn't
// count itself (the ruling).
export default defineCard({
  name: "Cosmic Epiphany",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Draw cards equal to the number of instant and sorcery cards in your graveyard.",
  targets: [],
  effect: {
    kind: "draw",
    amount: { countInGraveyard: { typesAnyOf: ["instant", "sorcery"], ownedBy: "you" } },
  },
});
