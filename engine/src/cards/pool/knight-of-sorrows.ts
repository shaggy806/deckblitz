import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 25493.
// Makes Spirit → use "Spirit Token (White-Black)".

export default defineCard({
  name: "Knight of Sorrows",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 3,
  toughness: 3,
  text: "This creature can block an additional creature each combat.\nAfterlife 1 (When this creature dies, create a 1/1 white and black Spirit creature token with flying.)",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Spirit Token (White-Black)", count: 1 },
      resolve: null,
      text: "Afterlife 1 (When this creature dies, create a 1/1 white and black Spirit creature token with flying.)",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      blockAdditional: 1,
      text: "This creature can block an additional creature each combat.",
    },
  ],
});
