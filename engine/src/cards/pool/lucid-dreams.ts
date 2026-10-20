import { defineCard } from "../define.js";

// Peer Past the Veil's count. The spell is still on the stack as X is
// counted, so it doesn't count itself (the third ruling); an artifact
// creature card counts as both types (the second).
export default defineCard({
  name: "Lucid Dreams",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Draw X cards, where X is the number of card types among cards in your graveyard.",
  targets: [],
  effect: { kind: "draw", amount: { cardTypesInGraveyard: { ownedBy: "you" } } },
});
