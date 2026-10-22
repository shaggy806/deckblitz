import { defineCard } from "../define.js";

// Ice Age (ICE). EDHREC rank 29884.
//
// The depletion counter rides on the mana ability itself (`add-mana`'s
// `also`, Kibo's Banana), so it's put on whenever the land is tapped for
// mana, the auto-payer's taps included.

export default defineCard({
  name: "Veldt",
  colors: [],
  types: ["land"],
  text: "This land doesn't untap during your untap step if it has a depletion counter on it.\nAt the beginning of your upkeep, remove a depletion counter from this land.\n{T}: Add {G} or {W}. Put a depletion counter on this land.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: { oneOf: ["G", "W"] },
        amount: 1,
        also: { kind: "add-counter", target: "source", counter: "depletion", amount: 1 },
      },
      resolve: null,
      text: "{T}: Add {G} or {W}. Put a depletion counter on this land.",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "remove-counter", target: "source", counter: "depletion", amount: 1 },
      resolve: null,
      text: "At the beginning of your upkeep, remove a depletion counter from this land.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "self-counters", counter: "depletion", compare: { op: "gte", n: 1 } },
      doesntUntap: true,
      text: "This land doesn't untap during your untap step if it has a depletion counter on it.",
    },
  ],
});
