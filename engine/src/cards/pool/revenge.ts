import { defineCard } from "../define.js";

// The right half of Revival // Revenge (see revival-revenge.ts).
//
// "Double your life total" is Beacon of Immortality's "your life total
// becomes" twice itself (rule 119.5: gain or lose the difference, so a
// negative total goes further below 0 — the ruling); the opponent's half is
// Rush of Dread's, read from their life as it resolves.
const FACES = ["Revival // Revenge", "Revival", "Revenge"];

export default defineCard({
  name: "Revenge",
  manaCost: "{4}{W}{B}",
  colors: ["W", "B"],
  types: ["sorcery"],
  text: "Double your life total. Target opponent loses half their life, rounded up.",
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "set-life-total", who: "you", amount: { product: [{ lifeTotal: "you" }, 2] } },
      { kind: "lose-life", target: 0, amount: { half: { lifeTotal: "each" }, round: "up" } },
    ],
  },
  faces: FACES,
  split: true,
});
