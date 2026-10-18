import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 25164.

export default defineCard({
  name: "Gitaxian Raptor",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Bird"],
  power: 1,
  toughness: 4,
  keywords: ["flying"],
  text: "Flying\nThis creature enters with three oil counters on it.\nRemove an oil counter from this creature: This creature gets +1/-1 until end of turn.",
  activated: [
    {
      cost: { mana: null, tap: false, removeCounter: { kind: "oil", count: 1 } },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: -1, duration: "end-of-turn" },
      resolve: null,
      text: "Remove an oil counter from this creature: This creature gets +1/-1 until end of turn.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "oil", amount: 3 } },
      text: "This creature enters with three oil counters on it.",
    },
  ],
});
