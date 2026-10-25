import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 12801.

export default defineCard({
  name: "Gatekeeper of Malakir",
  manaCost: "{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Warrior"],
  power: 2,
  toughness: 2,
  kicker: { cost: "{B}" },
  text: "Kicker {B} (You may pay an additional {B} as you cast this spell.)\nWhen this creature enters, if it was kicked, target player sacrifices a creature of their choice.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      effect: { kind: "sacrifice", who: "target", filter: { type: "creature" }, count: 1 },
      resolve: null,
      text: "When this creature enters, if it was kicked, target player sacrifices a creature of their choice.",
      condition: { kind: "self-kicked" },
    },
  ],
});
