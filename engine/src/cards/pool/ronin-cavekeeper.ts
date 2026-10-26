import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 28366.

export default defineCard({
  name: "Ronin Cavekeeper",
  manaCost: "{5}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Samurai"],
  power: 4,
  toughness: 3,
  text: "Bushido 2 (Whenever this creature blocks or becomes blocked, it gets +2/+2 until end of turn.)",
  triggered: [
    {
      trigger: { on: "blocks", who: "self" },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: "Bushido 2 (Whenever this creature blocks or becomes blocked, it gets +2/+2 until end of turn.)",
    },
    {
      trigger: { on: "becomes-blocked", who: "self" },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: "Bushido 2 (Whenever this creature blocks or becomes blocked, it gets +2/+2 until end of turn.)",
    },
  ],
});
