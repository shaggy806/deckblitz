import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 16266.

export default defineCard({
  name: "Moonlit Lamenter",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Treefolk", "Cleric"],
  power: 2,
  toughness: 5,
  text: "This creature enters with a -1/-1 counter on it.\n{1}{W}, Remove a counter from this creature: Draw a card. Activate only as a sorcery.",
  activated: [
    {
      cost: { mana: "{1}{W}", tap: false, removeCounter: { kind: "any", count: 1 } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "{1}{W}, Remove a counter from this creature: Draw a card. Activate only as a sorcery.",
      sorcerySpeed: true,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "-1/-1", amount: 1 } },
      text: "This creature enters with a -1/-1 counter on it.",
    },
  ],
});
