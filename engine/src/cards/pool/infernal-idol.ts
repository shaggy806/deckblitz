import { defineCard } from "../define.js";

// EDHREC rank 16494.
const DRAW_TEXT = "{1}{B}{B}, {T}, Sacrifice this artifact: You draw two cards and lose 2 life.";

export default defineCard({
  name: "Infernal Idol",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `{T}: Add {B}.\n${DRAW_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "B", amount: 1 },
      resolve: null,
      text: "{T}: Add {B}.",
    },
    {
      cost: { mana: "{1}{B}{B}", tap: true, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 2 },
          { kind: "lose-life", amount: 2, who: "you" },
        ],
      },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
