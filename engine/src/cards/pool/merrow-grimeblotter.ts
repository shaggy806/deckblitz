import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 31217.

export default defineCard({
  name: "Merrow Grimeblotter",
  manaCost: "{3}{U/B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 2,
  toughness: 2,
  text: "{1}{U/B}, {Q}: Target creature gets -2/-0 until end of turn. ({Q} is the untap symbol.)",
  activated: [
    {
      cost: { mana: "{1}{U/B}", tap: false, untap: true },
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: -2, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "{1}{U/B}, {Q}: Target creature gets -2/-0 until end of turn.",
    },
  ],
});
