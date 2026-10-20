import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 13828.

export default defineCard({
  name: "Secret Door",
  manaCost: "{U}",
  colors: ["U"],
  types: ["artifact", "creature"],
  subtypes: ["Wall"],
  power: 0,
  toughness: 4,
  keywords: ["defender"],
  text: "Defender\n{4}{U}: Venture into the dungeon. Activate only as a sorcery. (Enter the first room or advance to the next room.)",
  activated: [
    {
      cost: { mana: "{4}{U}", tap: false },
      targets: [],
      effect: { kind: "venture" },
      resolve: null,
      text: "{4}{U}: Venture into the dungeon. Activate only as a sorcery.",
      sorcerySpeed: true,
    },
  ],
});
