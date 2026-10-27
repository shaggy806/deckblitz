import { defineCard } from "../define.js";

export default defineCard({
  name: "Divine Congregation",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["sorcery"],
  suspend: { n: 5, cost: "{1}{W}" },
  text: "You gain 2 life for each creature target player controls.\nSuspend 5—{1}{W} (Rather than cast this card from your hand, you may pay {1}{W} and exile it with five time counters on it. At the beginning of your upkeep, remove a time counter. When the last is removed, you may cast it without paying its mana cost.)",
  targets: ["player"],
  effect: {
    kind: "gain-life",
    amount: { countOf: { type: "creature", controlledBy: "you" }, forTarget: 0, times: 2 },
  },
});
