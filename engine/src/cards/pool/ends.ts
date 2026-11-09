import { defineCard } from "../define.js";

const FACES = ["Odds // Ends", "Odds", "Ends"];

export default defineCard({
  name: "Ends",
  manaCost: "{3}{R}{W}",
  colors: ["R", "W"],
  types: ["instant"],
  text: "Target player sacrifices two attacking creatures of their choice.",
  targets: ["player"],
  effect: { kind: "sacrifice", who: "target", filter: { type: "creature", attacking: true }, count: 2 },
  faces: FACES,
  split: true,
});
