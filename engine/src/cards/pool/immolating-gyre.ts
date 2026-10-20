import { defineCard } from "../define.js";

// X is counted as it resolves; the Gyre is on the stack then, so it doesn't
// count itself (its ruling).

export default defineCard({
  name: "Immolating Gyre",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Immolating Gyre deals X damage to each creature and planeswalker you don't control, where X is the number of instant and sorcery cards in your graveyard.",
  targets: [],
  effect: {
    kind: "damage-all",
    amount: { countInGraveyard: { typesAnyOf: ["instant", "sorcery"], ownedBy: "you" } },
    filter: { typesAnyOf: ["creature", "planeswalker"], controlledBy: "opponent" },
  },
});
