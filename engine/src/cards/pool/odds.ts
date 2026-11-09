import { defineCard } from "../define.js";

const FACES = ["Odds // Ends", "Odds", "Ends"];

// "The Odds coin flip has no winner or loser" (the ruling).
export default defineCard({
  name: "Odds",
  manaCost: "{U}{R}",
  colors: ["U", "R"],
  types: ["instant"],
  text: "Flip a coin. If it comes up heads, counter target instant or sorcery spell. If it comes up tails, copy that spell and you may choose new targets for the copy.",
  targets: ["instant-or-sorcery-spell"],
  effect: {
    kind: "flip-coin",
    sides: true,
    heads: { kind: "counter", target: 0 },
    tails: { kind: "copy-spell", target: 0, newTargets: true },
  },
  faces: FACES,
  split: true,
});
