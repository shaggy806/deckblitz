import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 19329.

export default defineCard({
  name: "Rushwood Grove",
  colors: [],
  types: ["land"],
  text: "This land enters tapped.\n{T}: Put a storage counter on this land.\n{T}, Remove any number of storage counters from this land: Add {G} for each storage counter removed this way.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "storage", amount: 1 },
      resolve: null,
      text: "{T}: Put a storage counter on this land.",
    },
    {
      cost: { mana: null, tap: true, removeCounter: { kind: "storage", count: "x" } },
      targets: [],
      effect: { kind: "add-mana", mana: "G", amount: "x" },
      resolve: null,
      text: "{T}, Remove any number of storage counters from this land: Add {G} for each storage counter removed this way.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This land enters tapped.",
    },
  ],
});
