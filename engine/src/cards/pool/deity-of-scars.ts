import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 23776.

export default defineCard({
  name: "Deity of Scars",
  manaCost: "{B/G}{B/G}{B/G}{B/G}{B/G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Spirit", "Avatar"],
  power: 7,
  toughness: 7,
  keywords: ["trample"],
  text: "Trample\nThis creature enters with two -1/-1 counters on it.\n{B/G}, Remove a -1/-1 counter from this creature: Regenerate this creature.",
  activated: [
    {
      cost: { mana: "{B/G}", tap: false, removeCounter: { kind: "-1/-1", count: 1 } },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{B/G}, Remove a -1/-1 counter from this creature: Regenerate this creature.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "-1/-1", amount: 2 } },
      text: "This creature enters with two -1/-1 counters on it.",
    },
  ],
});
