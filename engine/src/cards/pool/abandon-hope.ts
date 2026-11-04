import { defineCard } from "../define.js";

// One X, paid twice: in mana and in cards discarded (rule 107.3a), so no more than the other cards
// in hand. Exactly X chosen, as many as the opponent holds when they hold fewer (rule 609.3).

export default defineCard({
  name: "Abandon Hope",
  manaCost: "{X}{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "As an additional cost to cast this spell, discard X cards.\nLook at target opponent's hand and choose X cards from it. That player discards those cards.",
  additionalCost: { discard: "x" },
  targets: ["opponent"],
  effect: { kind: "discard-chosen", target: 0, lookOnly: true, picks: "x" },
});
