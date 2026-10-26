import { defineCard } from "../define.js";

// The right half of Hit // Run. Each attacking creature you control counts
// every attacking creature but itself — the number attacking less one, read
// as it resolves.
const FACES = ["Hit // Run", "Hit", "Run"];

export default defineCard({
  name: "Run",
  manaCost: "{3}{R}{G}",
  colors: ["R", "G"],
  types: ["instant"],
  text: "Attacking creatures you control get +1/+0 until end of turn for each other attacking creature.",
  targets: [],
  effect: {
    kind: "modify-pt-all",
    filter: { type: "creature", attacking: true, controlledBy: "you" },
    power: { difference: [{ countOf: { type: "creature", attacking: true } }, 1] },
    toughness: 0,
    duration: "end-of-turn",
  },
  faces: FACES,
  split: true,
});
