import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 18909.

export default defineCard({
  name: "Zalto, Fire Giant Duke",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Giant", "Barbarian"],
  power: 7,
  toughness: 3,
  keywords: ["trample"],
  text: "Trample\nWhenever Zalto is dealt damage, venture into the dungeon. (Enter the first room or advance to the next room.)",
  triggered: [
    {
      trigger: { on: "dealt-damage", who: "self" },
      targets: [],
      effect: { kind: "venture" },
      resolve: null,
      text: "Whenever Zalto is dealt damage, venture into the dungeon.",
    },
  ],
});
