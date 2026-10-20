import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 19215.

export default defineCard({
  name: "Clattering Skeletons",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Skeleton"],
  power: 4,
  toughness: 3,
  text: "When this creature dies, venture into the dungeon. (Enter the first room or advance to the next room.)",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "venture" },
      resolve: null,
      text: "When this creature dies, venture into the dungeon.",
    },
  ],
});
