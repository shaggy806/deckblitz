import { defineCard } from "../define.js";

// EDHREC rank 7867.
//
// "Each opponent who has three or more poison counters loses 1 life" is a
// `for-each-player` over the opponents, each asked about on their own (the
// `"that-player"` corrupted check, as Ixhel's), all losing it as one event.

const TAPPED_TEXT =
  "Corrupted — Whenever this artifact becomes tapped, each opponent who has three or more poison counters loses 1 life.";

export default defineCard({
  name: "Phyrexian Atlas",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `{T}: Add one mana of any color.\n${TAPPED_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: "{T}: Add one mana of any color.",
    },
  ],
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "self" },
      targets: [],
      effect: {
        kind: "for-each-player",
        who: "each-opponent",
        simultaneous: true,
        effect: {
          kind: "conditional",
          condition: { kind: "player-counters", counter: "poison", who: "that-player", atLeast: 3 },
          then: { kind: "lose-life", amount: 1, who: "that-player" },
        },
      },
      resolve: null,
      text: TAPPED_TEXT,
    },
  ],
});
