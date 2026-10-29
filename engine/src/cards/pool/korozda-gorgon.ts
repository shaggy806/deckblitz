import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 24834.

export default defineCard({
  name: "Korozda Gorgon",
  manaCost: "{3}{B}{G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Gorgon"],
  power: 2,
  toughness: 5,
  keywords: ["deathtouch"],
  text: "Deathtouch\n{2}, Remove a +1/+1 counter from a creature you control: Target creature gets -1/-1 until end of turn.",
  activated: [
    {
      cost: {
        mana: "{2}",
        tap: false,
        removeCounter: { kind: "+1/+1", count: 1, from: { type: "creature" } },
      },
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: -1, toughness: -1, duration: "end-of-turn" },
      resolve: null,
      text: "{2}, Remove a +1/+1 counter from a creature you control: Target creature gets -1/-1 until end of turn.",
    },
  ],
});
