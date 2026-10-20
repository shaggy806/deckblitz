import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 12877.

export default defineCard({
  name: "Displacer Beast",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Cat", "Beast"],
  power: 3,
  toughness: 2,
  text: "When this creature enters, venture into the dungeon. (Enter the first room or advance to the next room.)\nDisplacement — {3}{U}: Return this creature to its owner's hand.",
  activated: [
    {
      cost: { mana: "{3}{U}", tap: false },
      targets: [],
      effect: { kind: "return-to-hand", target: "source" },
      resolve: null,
      text: "Displacement — {3}{U}: Return this creature to its owner's hand.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "venture" },
      resolve: null,
      text: "When this creature enters, venture into the dungeon.",
    },
  ],
});
