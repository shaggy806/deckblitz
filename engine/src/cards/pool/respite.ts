import { defineCard } from "../define.js";

// EDHREC rank 8688.

export default defineCard({
  name: "Respite",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Prevent all combat damage that would be dealt this turn. You gain 1 life for each attacking creature.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "prevent-all-combat-damage" },
      // Every attacking creature, whoever controls it (Wingmate Roc's count).
      { kind: "gain-life", amount: { countOf: { type: "creature", attacking: true } } },
    ],
  },
});
