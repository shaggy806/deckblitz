import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 19430.

export default defineCard({
  name: "Goblin Ruinblaster",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Shaman"],
  power: 2,
  toughness: 1,
  keywords: ["haste"],
  kicker: { cost: "{R}" },
  text: "Kicker {R} (You may pay an additional {R} as you cast this spell.)\nHaste\nWhen this creature enters, if it was kicked, destroy target nonbasic land.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", filter: { notSupertype: "basic", type: "land" } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "When this creature enters, if it was kicked, destroy target nonbasic land.",
      condition: { kind: "self-kicked" },
    },
  ],
});
