import { defineCard } from "../define.js";

// EDHREC rank 23455.
//
// "That permanent's mana value" is the permanent's, read while it's still on
// the battlefield (a `target` condition, before the exile — the same answer
// last-known information would give, and {X} counts 0 there, the ruling).
// 3 or less: a `flicker` exiles it and returns it at once, tapped, under the
// caster's control — a token exiled stays gone (rule 111.7) — and the delayed
// exile is about the permanent it returned as (`about: "put-onto-battlefield"`),
// a new object (rule 400.7). Otherwise it's just exiled.
const TEXT =
  "Exile target creature or planeswalker. If that permanent's mana value was 3 or less, return it to the battlefield tapped under your control. Exile it at the beginning of the next end step.";

export default defineCard({
  name: "Vindictive Triumph",
  manaCost: "{W}{B}{B}",
  colors: ["W", "B"],
  types: ["instant"],
  text: TEXT,
  targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  effect: {
    kind: "conditional",
    condition: { kind: "target", index: 0, filter: { manaValue: { op: "lte", n: 3 } } },
    then: {
      kind: "sequence",
      effects: [
        { kind: "flicker", target: 0, underYourControl: true, tapped: true },
        {
          kind: "delayed-trigger",
          at: "next-end-step",
          about: "put-onto-battlefield",
          effect: { kind: "exile", target: 0 },
          text: "Exile it.",
        },
      ],
    },
    else: { kind: "exile", target: 0 },
  },
});
