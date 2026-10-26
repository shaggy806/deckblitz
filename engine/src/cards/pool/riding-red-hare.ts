import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 26453.

export default defineCard({
  name: "Riding Red Hare",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Target creature gets +3/+3 and gains horsemanship until end of turn. (It can't be blocked except by creatures with horsemanship.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 3, toughness: 3, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "horsemanship", duration: "end-of-turn" },
    ],
  },
});
