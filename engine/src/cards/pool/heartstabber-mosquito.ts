import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 25163.

export default defineCard({
  name: "Heartstabber Mosquito",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Insect"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  kicker: { cost: "{2}{B}" },
  text: "Kicker {2}{B} (You may pay an additional {2}{B} as you cast this spell.)\nFlying\nWhen this creature enters, if it was kicked, destroy target creature.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "When this creature enters, if it was kicked, destroy target creature.",
      condition: { kind: "self-kicked" },
    },
  ],
});
