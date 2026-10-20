import { defineCard } from "../define.js";

// EDHREC rank 14532.

export default defineCard({
  name: "Spell Satchel",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: "Magecraft — Whenever you cast or copy an instant or sorcery spell, put a book counter on this artifact.\n{T}, Remove a book counter from this artifact: Add {C}.\n{3}, {T}, Remove three book counters from this artifact: Draw a card.",
  activated: [
    {
      cost: { mana: null, tap: true, removeCounter: { kind: "book", count: 1 } },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}, Remove a book counter from this artifact: Add {C}.",
    },
    {
      cost: { mana: "{3}", tap: true, removeCounter: { kind: "book", count: 3 } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "{3}, {T}, Remove three book counters from this artifact: Draw a card.",
    },
  ],
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        orCopy: true,
        filter: { typesAnyOf: ["instant", "sorcery"] },
      },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "book", amount: 1 },
      resolve: null,
      text: "Magecraft — Whenever you cast or copy an instant or sorcery spell, put a book counter on this artifact.",
    },
  ],
});
