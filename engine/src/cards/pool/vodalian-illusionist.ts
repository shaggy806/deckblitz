import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 17882.

export default defineCard({
  name: "Vodalian Illusionist",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 2,
  toughness: 2,
  text: "{U}{U}, {T}: Target creature phases out. (While it's phased out, it's treated as though it doesn't exist. It phases in before its controller untaps during their next untap step.)",
  activated: [
    {
      cost: { mana: "{U}{U}", tap: true },
      targets: ["creature"],
      effect: { kind: "phase-out", target: 0 },
      resolve: null,
      text: "{U}{U}, {T}: Target creature phases out.",
    },
  ],
});
