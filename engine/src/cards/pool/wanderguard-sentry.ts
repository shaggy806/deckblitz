import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 31886.

export default defineCard({
  name: "Wanderguard Sentry",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Drone"],
  power: 3,
  toughness: 3,
  text: "When this creature enters, look at target opponent's hand.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: { kind: "look-at-hand", target: 0 },
      resolve: null,
      text: "When this creature enters, look at target opponent's hand.",
    },
  ],
});
