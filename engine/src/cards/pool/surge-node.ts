import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 17923.

export default defineCard({
  name: "Surge Node",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: "This artifact enters with six charge counters on it.\n{1}, {T}, Remove a charge counter from this artifact: Put a charge counter on target artifact.",
  activated: [
    {
      cost: { mana: "{1}", tap: true, removeCounter: { kind: "charge", count: 1 } },
      targets: ["artifact"],
      effect: { kind: "add-counter", target: 0, counter: "charge", amount: 1 },
      resolve: null,
      text: "{1}, {T}, Remove a charge counter from this artifact: Put a charge counter on target artifact.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "charge", amount: 6 } },
      text: "This artifact enters with six charge counters on it.",
    },
  ],
});
