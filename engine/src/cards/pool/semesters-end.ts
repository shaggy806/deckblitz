import { defineCard } from "../define.js";

// EDHREC rank 2753. Eerie Interlude's any-number flicker, returning at the next end step, with
// Teferi's Time Twist's "enters with an additional +1/+1 counter if it's a creature" and, through
// `and`, a loyalty counter if it's a planeswalker — each judged on the permanent as it returns
// (the ruling), so a creature planeswalker gets both.
//
// Rulings:
//   Use the characteristics of each permanent as it returns to the battlefield to determine if it
//     should enter with an additional +1/+1 counter, an additional loyalty counter, or in very
//     unusual cases, both.

const TEXT =
  "Exile any number of target creatures and/or planeswalkers you control. At the beginning of the next end step, return each of them to the battlefield under its owner's control. Each of them enters with an additional +1/+1 counter on it if it's a creature and an additional loyalty counter on it if it's a planeswalker.";

export default defineCard({
  name: "Semester's End",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["instant"],
  text: TEXT,
  targets: [
    {
      kind: "any-number",
      of: { kind: "permanent", whose: "you", filter: { typesAnyOf: ["creature", "planeswalker"] } },
    },
  ],
  effect: {
    kind: "flicker",
    target: { from: 0 },
    returnAt: { step: "end" },
    thenCounters: {
      kind: "+1/+1",
      amount: 1,
      onlyIf: { type: "creature" },
      entering: true,
      and: { kind: "loyalty", amount: 1, onlyIf: { type: "planeswalker" }, entering: true },
    },
    returnText:
      "Return each of them to the battlefield under its owner's control. Each of them enters with an additional +1/+1 counter on it if it's a creature and an additional loyalty counter on it if it's a planeswalker.",
  },
});
