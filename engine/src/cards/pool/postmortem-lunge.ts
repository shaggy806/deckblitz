import { defineCard } from "../define.js";

// EDHREC rank 18910.
//
// X is chosen before targets (rule 601.2b-c), so the target's mana value is read against it.
// A creature that has left by the end step isn't exiled (the ruling): the delayed exile acts on
// the permanent the card became, and on nothing once that's gone.

export default defineCard({
  name: "Postmortem Lunge",
  manaCost: "{X}{B/P}",
  colors: ["B"],
  types: ["sorcery"],
  text: "({B/P} can be paid with either {B} or 2 life.)\nReturn target creature card with mana value X from your graveyard to the battlefield. It gains haste. Exile it at the beginning of the next end step.",
  targets: [
    {
      kind: "card-in-graveyard",
      whose: "you",
      filter: { type: "creature", manaValue: { op: "eq", n: { amount: "x" } } },
    },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "put-onto-battlefield", target: 0 },
      { kind: "grant-keyword", target: 0, keyword: "haste", duration: "permanent" },
      {
        kind: "delayed-trigger",
        at: "next-end-step",
        effect: { kind: "exile", target: 0 },
        text: "Exile the creature Postmortem Lunge returned to the battlefield.",
      },
    ],
  },
});
