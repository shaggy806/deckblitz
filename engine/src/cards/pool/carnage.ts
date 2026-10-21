import { defineCard } from "../define.js";

const FACES = ["Carnival // Carnage", "Carnival", "Carnage"];
const CARNAGE_TEXT = "Carnage deals 3 damage to target opponent. That player discards two cards.";

// The right half of Carnival // Carnage (see carnival-carnage.ts). An illegal
// target means no damage and no discard (the ruling).
export default defineCard({
  name: "Carnage",
  manaCost: "{2}{B}{R}",
  colors: ["B", "R"],
  types: ["sorcery"],
  text: CARNAGE_TEXT,
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 3, target: 0 },
      { kind: "discard", target: 0, amount: 2 },
    ],
  },
  faces: FACES,
  split: true,
});
