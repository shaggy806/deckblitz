import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 8981.

export default defineCard({
  name: "Dungeon Descent",
  colors: [],
  types: ["land"],
  text: "This land enters tapped.\n{T}: Add {C}.\n{4}, {T}, Tap an untapped legendary creature you control: Venture into the dungeon. Activate only as a sorcery. (Enter the first room or advance to the next room.)",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: {
        mana: "{4}",
        tap: true,
        tapOthers: { count: 1, filter: { supertype: "legendary", type: "creature", controlledBy: "you" } },
      },
      targets: [],
      effect: { kind: "venture" },
      resolve: null,
      text: "{4}, {T}, Tap an untapped legendary creature you control: Venture into the dungeon. Activate only as a sorcery.",
      sorcerySpeed: true,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This land enters tapped.",
    },
  ],
});
