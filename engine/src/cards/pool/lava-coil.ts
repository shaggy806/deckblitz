import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 15713.

export default defineCard({
  name: "Lava Coil",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Lava Coil deals 4 damage to target creature. If that creature would die this turn, exile it instead.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [{ kind: "damage", amount: 4, target: 0 }, { kind: "exile-if-dies-this-turn", target: 0 }],
  },
});
