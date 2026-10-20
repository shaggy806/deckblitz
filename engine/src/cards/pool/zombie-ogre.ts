import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 18488.

export default defineCard({
  name: "Zombie Ogre",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Ogre"],
  power: 3,
  toughness: 5,
  text: "At the beginning of your end step, if a creature died this turn, venture into the dungeon. (Enter the first room or advance to the next room.)",
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: { kind: "venture" },
      resolve: null,
      text: "At the beginning of your end step, if a creature died this turn, venture into the dungeon.",
      condition: { kind: "creature-died-this-turn" },
    },
  ],
});
