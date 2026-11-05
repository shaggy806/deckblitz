import { defineCard } from "../define.js";

// EDHREC rank 23970.

export default defineCard({
  name: "Check for Traps",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target opponent reveals their hand. You choose a nonland card from it. Exile that card. If an instant card or a card with flash is exiled this way, they lose 1 life. Otherwise, you lose 1 life.",
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "discard-chosen", target: 0, filter: { notTypes: ["land"] }, destination: "exile" },
      {
        kind: "conditional",
        condition: {
          kind: "this-way",
          what: "exiled",
          filter: { anyOf: [{ type: "instant" }, { keyword: "flash" }] },
        },
        then: { kind: "lose-life", amount: 1, target: 0 },
        else: { kind: "lose-life", amount: 1 },
      },
    ],
  },
});
