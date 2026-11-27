import { defineCard } from "../define.js";

// The left half of Rise // Fall (see rise-fall.ts). Two targets, each
// returned to its owner's hand; with one gone illegal the other still
// returns (rule 608.2b).
const FACES = ["Rise // Fall", "Rise", "Fall"];

export default defineCard({
  name: "Rise",
  manaCost: "{U}{B}",
  colors: ["U", "B"],
  types: ["sorcery"],
  text: "Return target creature card from a graveyard and target creature on the battlefield to their owners' hands.",
  targets: [{ kind: "card-in-graveyard", whose: "any", filter: { type: "creature" } }, "creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "return-to-hand", target: 0, from: "graveyard" },
      { kind: "return-to-hand", target: 1 },
    ],
  },
  faces: FACES,
  split: true,
});
