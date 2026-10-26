import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 30641.

export default defineCard({
  name: "Merrow Wavebreakers",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Soldier"],
  power: 3,
  toughness: 3,
  text: "{1}{U}, {Q}: This creature gains flying until end of turn. ({Q} is the untap symbol.)",
  activated: [
    {
      cost: { mana: "{1}{U}", tap: false, untap: true },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "flying", duration: "end-of-turn" },
      resolve: null,
      text: "{1}{U}, {Q}: This creature gains flying until end of turn.",
    },
  ],
});
