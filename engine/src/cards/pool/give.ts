import { defineCard } from "../define.js";

const FACES = ["Give // Take", "Give", "Take"];

// The left half of Give // Take (see give-take.ts).
export default defineCard({
  name: "Give",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Put three +1/+1 counters on target creature.\nFuse (You may cast one or both halves of this card from your hand.)",
  targets: ["creature"],
  effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 3 },
  faces: FACES,
  split: true,
});
