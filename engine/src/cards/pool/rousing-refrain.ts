import { defineCard } from "../define.js";

export default defineCard({
  name: "Rousing Refrain",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  suspend: { n: 3, cost: "{1}{R}" },
  text: "Add {R} for each card in target opponent's hand. Until end of turn, you don't lose this mana as steps and phases end. Exile Rousing Refrain with three time counters on it.\nSuspend 3—{1}{R} (Rather than cast this card from your hand, you may pay {1}{R} and exile it with three time counters on it. At the beginning of your upkeep, remove a time counter. When the last is removed, you may cast it without paying its mana cost.)",
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-mana", mana: "R", amount: { cardsInHand: { target: 0 } }, persists: true },
      { kind: "give-suspend", target: "source", timeCounters: 3 },
    ],
  },
});
