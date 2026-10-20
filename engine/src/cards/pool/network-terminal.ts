import { defineCard } from "../define.js";

// EDHREC rank 9456. "Tap another untapped artifact you control" is a
// `tapOthers` cost that can't pick this artifact (which {T} taps anyway).

const LOOT_TEXT = "{1}, {T}, Tap another untapped artifact you control: Draw a card, then discard a card.";

export default defineCard({
  name: "Network Terminal",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `{T}: Add one mana of any color.\n${LOOT_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: "{T}: Add one mana of any color.",
    },
    {
      cost: {
        mana: "{1}",
        tap: true,
        tapOthers: { count: 1, filter: { type: "artifact", controlledBy: "you" } },
      },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "discard", target: "you", amount: 1 },
        ],
      },
      resolve: null,
      text: LOOT_TEXT,
    },
  ],
});
