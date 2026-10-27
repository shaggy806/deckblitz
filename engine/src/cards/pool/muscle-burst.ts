import { defineCard } from "../define.js";

// Odyssey. EDHREC rank 30454.

const X = { sum: [3, { countInGraveyard: { name: "Muscle Burst" } }] } as const;

export default defineCard({
  name: "Muscle Burst",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Target creature gets +X/+X until end of turn, where X is 3 plus the number of cards named Muscle Burst in all graveyards.",
  targets: ["creature"],
  effect: { kind: "modify-pt", target: 0, power: X, toughness: X, duration: "end-of-turn" },
});
