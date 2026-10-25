import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 23491.

export default defineCard({
  name: "Death Frenzy",
  manaCost: "{3}{B}{G}",
  colors: ["B", "G"],
  types: ["sorcery"],
  text: "All creatures get -2/-2 until end of turn. Whenever a creature dies this turn, you gain 1 life.",
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "modify-pt-all",
        filter: { type: "creature" },
        power: -2,
        toughness: -2,
        duration: "end-of-turn",
      },
      {
        kind: "delayed-trigger",
        at: { whenever: { on: "dies", who: "any", filter: { type: "creature" } } },
        effect: { kind: "gain-life", amount: 1 },
        text: "Whenever a creature dies this turn, you gain 1 life.",
      },
    ],
  },
});
