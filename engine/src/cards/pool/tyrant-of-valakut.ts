import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 25512.

export default defineCard({
  name: "Tyrant of Valakut",
  manaCost: "{5}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 5,
  toughness: 4,
  keywords: ["flying"],
  alternativeCost: {
    mana: "{3}{R}{R}",
    keyword: "surge",
    condition: { kind: "cast-this-turn", who: "you", atLeast: 1 },
  },
  text: "Surge {3}{R}{R} (You may cast this spell for its surge cost if you or a teammate has cast another spell this turn.)\nFlying\nWhen this creature enters, if its surge cost was paid, it deals 3 damage to any target.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 3, target: 0 },
      resolve: null,
      text: "When this creature enters, if its surge cost was paid, it deals 3 damage to any target.",
      condition: { kind: "self-surge-paid" },
    },
  ],
});
