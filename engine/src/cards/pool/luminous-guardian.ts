import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 31978.

export default defineCard({
  name: "Luminous Guardian",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Nomad"],
  power: 1,
  toughness: 4,
  text: "{W}: This creature gets +0/+1 until end of turn.\n{2}: This creature can block an additional creature this turn.",
  activated: [
    {
      cost: { mana: "{W}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 0, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "{W}: This creature gets +0/+1 until end of turn.",
    },
    {
      cost: { mana: "{2}", tap: false },
      targets: [],
      effect: { kind: "block-additional", target: "source", amount: 1, duration: "end-of-turn" },
      resolve: null,
      text: "{2}: This creature can block an additional creature this turn.",
    },
  ],
});
