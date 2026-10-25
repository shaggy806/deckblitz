import { defineCard } from "../define.js";

// The alternative cost's opponent is any one opponent counted alone (the
// `turn-stat` condition's `"opponent"`); the player targeted needn't be that
// one (its ruling).

export default defineCard({
  name: "Runeflare Trap",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["instant"],
  subtypes: ["Trap"],
  text: "If an opponent drew three or more cards this turn, you may pay {R} rather than pay this spell's mana cost.\nRuneflare Trap deals damage to target player equal to the number of cards in that player's hand.",
  targets: ["player"],
  effect: { kind: "damage", target: 0, amount: { cardsInHand: "each" } },
  alternativeCost: { mana: "{R}", condition: { kind: "turn-stat", stat: "cards-drawn", who: "opponent", atLeast: 3 } },
});
