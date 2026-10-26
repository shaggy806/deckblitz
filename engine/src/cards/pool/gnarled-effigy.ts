import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 27768.

export default defineCard({
  name: "Gnarled Effigy",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: "{4}, {T}: Put a -1/-1 counter on target creature.",
  activated: [
    {
      cost: { mana: "{4}", tap: true },
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "-1/-1", amount: 1 },
      resolve: null,
      text: "{4}, {T}: Put a -1/-1 counter on target creature.",
    },
  ],
});
