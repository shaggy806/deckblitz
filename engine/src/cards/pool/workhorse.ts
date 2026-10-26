import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 13347.

export default defineCard({
  name: "Workhorse",
  manaCost: "{6}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Horse"],
  power: 0,
  toughness: 0,
  text: "This creature enters with four +1/+1 counters on it.\nRemove a +1/+1 counter from this creature: Add {C}.",
  activated: [
    {
      cost: { mana: null, tap: false, removeCounter: { kind: "+1/+1", count: 1 } },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "Remove a +1/+1 counter from this creature: Add {C}.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 4 } },
      text: "This creature enters with four +1/+1 counters on it.",
    },
  ],
});
