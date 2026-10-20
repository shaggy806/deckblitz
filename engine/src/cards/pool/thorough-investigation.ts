import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 7190.
// Makes Clue → use "Clue Token".

export default defineCard({
  name: "Thorough Investigation",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: "Whenever you attack, investigate. (Create a Clue token. It's an artifact with \"{2}, Sacrifice this token: Draw a card.\")\nWhenever you sacrifice a Clue, venture into the dungeon. (Enter the first room or advance to the next room.)",
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1 },
      targets: [],
      effect: { kind: "create-token", token: "Clue Token", count: 1 },
      resolve: null,
      text: "Whenever you attack, investigate.",
    },
    {
      trigger: { on: "sacrifice", who: "you", filter: { subtype: "Clue" } },
      targets: [],
      effect: { kind: "venture" },
      resolve: null,
      text: "Whenever you sacrifice a Clue, venture into the dungeon.",
    },
  ],
});
