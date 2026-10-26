import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 24243.

export default defineCard({
  name: "Etched Monstrosity",
  manaCost: "{5}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Phyrexian", "Golem"],
  power: 10,
  toughness: 10,
  text: "This creature enters with five -1/-1 counters on it.\n{W}{U}{B}{R}{G}, Remove five -1/-1 counters from this creature: Target player draws three cards.",
  activated: [
    {
      cost: { mana: "{W}{U}{B}{R}{G}", tap: false, removeCounter: { kind: "-1/-1", count: 5 } },
      targets: ["player"],
      effect: { kind: "draw", amount: 3, target: 0 },
      resolve: null,
      text: "{W}{U}{B}{R}{G}, Remove five -1/-1 counters from this creature: Target player draws three cards.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "-1/-1", amount: 5 } },
      text: "This creature enters with five -1/-1 counters on it.",
    },
  ],
});
