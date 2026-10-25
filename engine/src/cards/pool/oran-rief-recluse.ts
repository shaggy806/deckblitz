import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 19268.

export default defineCard({
  name: "Oran-Rief Recluse",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Spider"],
  power: 1,
  toughness: 3,
  keywords: ["reach"],
  kicker: { cost: "{2}{G}" },
  text: "Kicker {2}{G} (You may pay an additional {2}{G} as you cast this spell.)\nReach (This creature can block creatures with flying.)\nWhen this creature enters, if it was kicked, destroy target creature with flying.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", filter: { type: "creature", keyword: "flying" } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "When this creature enters, if it was kicked, destroy target creature with flying.",
      condition: { kind: "self-kicked" },
    },
  ],
});
