import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 19319.

export default defineCard({
  name: "Shapers of Nature",
  manaCost: "{1}{G}{U}",
  colors: ["U", "G"],
  types: ["creature"],
  subtypes: ["Merfolk", "Shaman"],
  power: 3,
  toughness: 3,
  text: "{3}{G}: Put a +1/+1 counter on target creature.\n{2}{U}, Remove a +1/+1 counter from a creature you control: Draw a card.",
  activated: [
    {
      cost: { mana: "{3}{G}", tap: false },
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "{3}{G}: Put a +1/+1 counter on target creature.",
    },
    {
      cost: {
        mana: "{2}{U}",
        tap: false,
        removeCounter: { kind: "+1/+1", count: 1, from: { type: "creature" } },
      },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "{2}{U}, Remove a +1/+1 counter from a creature you control: Draw a card.",
    },
  ],
});
