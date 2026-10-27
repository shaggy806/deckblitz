import { defineCard } from "../define.js";
import { distinctTargets } from "../helpers.js";

const FACES = ["Find // Finality", "Find", "Finality"];

// The left half of Find // Finality (see find-finality.ts).
export default defineCard({
  name: "Find",
  manaCost: "{B/G}{B/G}",
  colors: ["B", "G"],
  types: ["sorcery"],
  text: "Return up to two target creature cards from your graveyard to your hand.",
  targets: distinctTargets(2, { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }, { optional: true }),
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "return-to-hand", target: 0, from: "graveyard" },
      { kind: "return-to-hand", target: 1, from: "graveyard" },
    ],
  },
  faces: FACES,
  split: true,
});
