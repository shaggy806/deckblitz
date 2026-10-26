import { defineCard } from "../define.js";

// EDHREC rank 27898. Counted as it resolves (the ruling).
export default defineCard({
  name: "Scrapyard Salvo",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Scrapyard Salvo deals damage to target player or planeswalker equal to the number of artifact cards in your graveyard.",
  targets: ["player-or-planeswalker"],
  effect: { kind: "damage", target: 0, amount: { countInGraveyard: { type: "artifact", ownedBy: "you" } } },
});
