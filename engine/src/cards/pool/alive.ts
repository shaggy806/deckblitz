import { defineCard } from "../define.js";

const FACES = ["Alive // Well", "Alive", "Well"];

// The left half of Alive // Well (see alive-well.ts).
export default defineCard({
  name: "Alive",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Create a 3/3 green Centaur creature token.\nFuse (You may cast one or both halves of this card from your hand.)",
  targets: [],
  effect: { kind: "create-token", token: "3/3 Centaur Token", count: 1 },
  faces: FACES,
  split: true,
});
