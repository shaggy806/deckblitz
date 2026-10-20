import { defineCard } from "../define.js";

// EDHREC rank 8051.
//
// "You may exile a creature card from among the cards milled this way" is a
// choice over every player's milled cards (`zone: "graveyards"` with a
// `thisWay: "milled"` filter — Mind Roots's shape); "if you do" is the
// choice's `then`, skipped when nothing was exiled, and "that card" is the
// card chosen, now in exile. It keeps this ability through the copy
// (`thisAbility`, Thespian's Stage's shape), for good.

const UPKEEP_TEXT =
  "At the beginning of your upkeep, each player mills three cards. You may exile a creature card from among the " +
  "cards milled this way. If you do, this creature becomes a copy of that card, except it has this ability.";

export default defineCard({
  name: "Shadow Kin",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Shapeshifter"],
  power: 2,
  toughness: 2,
  keywords: ["flash"],
  text: `Flash\n${UPKEEP_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "each-player", amount: 3 },
          {
            kind: "look-and-choose",
            zone: "graveyards",
            min: 0,
            max: 1,
            destination: "exile",
            // Not linked (rule 607.2a): no "the exiled card" refers to it.
            unlinked: true,
            leftover: "stay",
            filter: { type: "creature", thisWay: "milled" },
            then: {
              kind: "become-copy",
              target: "source",
              of: 0,
              ofCard: true,
              exceptions: { thisAbility: { card: "Shadow Kin", triggered: 0 } },
            },
          },
        ],
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
