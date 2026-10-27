import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 21549.

export default defineCard({
  name: "Barbed Lightning",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  kicker: { cost: "{2}", keyword: "entwine" },
  text: "Choose one —\n• Barbed Lightning deals 3 damage to target creature.\n• Barbed Lightning deals 3 damage to target player or planeswalker.\nEntwine {2} (Choose both if you pay the entwine cost.)",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Barbed Lightning deals 3 damage to target creature.",
        targets: ["creature"],
        effect: { kind: "damage", amount: 3, target: 0 },
      },
      {
        text: "Barbed Lightning deals 3 damage to target player or planeswalker.",
        targets: ["player-or-planeswalker"],
        effect: { kind: "damage", amount: 3, target: 0 },
      },
    ],
    kickedModes: 2,
  },
});
