import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 28088.

export default defineCard({
  name: "Pith Driller",
  manaCost: "{4}{B/P}",
  colors: ["B"],
  types: ["artifact", "creature"],
  subtypes: ["Phyrexian", "Horror"],
  power: 2,
  toughness: 4,
  text: "({B/P} can be paid with either {B} or 2 life.)\nWhen this creature enters, put a -1/-1 counter on target creature.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "-1/-1", amount: 1 },
      resolve: null,
      text: "When this creature enters, put a -1/-1 counter on target creature.",
    },
  ],
});
