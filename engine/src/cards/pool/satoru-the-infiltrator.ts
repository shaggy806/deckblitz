import { defineCard } from "../define.js";

// EDHREC rank 3357. A cast creature enters alone, so the batch's "none of them
// were cast or no mana was spent" is each member's own (no mana spent, which
// covers not being cast at all): a single creature cast with mana entering
// never reaches the trigger, and one cast for {0} or put in does.

const TEXT =
  "Whenever Satoru and/or one or more other nontoken creatures you control enter, if none of them were cast or no mana was spent to cast them, draw a card.";

export default defineCard({
  name: "Satoru, the Infiltrator",
  manaCost: "{U}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Ninja", "Rogue"],
  power: 2,
  toughness: 3,
  keywords: ["menace"],
  text: `Menace\n${TEXT}`,
  triggered: [
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        batched: true,
        // "Nontoken" limits only the others: a token copy of Satoru counts.
        filter: { type: "creature", anyOf: [{ isSource: true }, { token: false }], manaSpent: [{ amount: { op: "eq", n: 0 } }] },
      },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
