import { defineCard } from "../define.js";

// EDHREC rank 3351.
//
// The opponents' life gain is part of the mana ability (`also`, applied right
// after the mana, off the stack — Kibo, Uktabi Prince's Banana's shape).
const COLORED_TEXT = "{T}: Add {R} or {G}. Each opponent gains 1 life.";

export default defineCard({
  name: "Grove of the Burnwillows",
  colors: [],
  types: ["land"],
  text: `{T}: Add {C}.\n${COLORED_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: { oneOf: ["R", "G"] },
        amount: 1,
        also: { kind: "gain-life", amount: 1, who: "each-opponent" },
      },
      resolve: null,
      text: COLORED_TEXT,
    },
  ],
});
