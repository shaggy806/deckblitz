import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 13151.

export default defineCard({
  name: "Quillspike",
  manaCost: "{2}{B/G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 1,
  toughness: 1,
  text: "{B/G}, Remove a -1/-1 counter from a creature you control: This creature gets +3/+3 until end of turn.",
  activated: [
    {
      cost: {
        mana: "{B/G}",
        tap: false,
        removeCounter: { kind: "-1/-1", count: 1, from: { type: "creature" } },
      },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 3, toughness: 3, duration: "end-of-turn" },
      resolve: null,
      text: "{B/G}, Remove a -1/-1 counter from a creature you control: This creature gets +3/+3 until end of turn.",
    },
  ],
});
