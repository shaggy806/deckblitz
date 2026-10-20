import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 15391.

export default defineCard({
  name: "Blink Dog",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Dog"],
  power: 1,
  toughness: 1,
  keywords: ["double-strike"],
  text: "Double strike\nTeleport — {3}{W}: This creature phases out. (Treat it and anything attached to it as though they don't exist until your next turn.)",
  activated: [
    {
      cost: { mana: "{3}{W}", tap: false },
      targets: [],
      effect: { kind: "phase-out", target: "source" },
      resolve: null,
      text: "Teleport — {3}{W}: This creature phases out.",
    },
  ],
});
