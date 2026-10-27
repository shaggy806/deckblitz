import { defineCard } from "../define.js";

const FACES = ["Order // Chaos", "Order", "Chaos"];

// The left half of Order // Chaos (see order-chaos.ts).
export default defineCard({
  name: "Order",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Exile target attacking creature.",
  targets: [{ kind: "permanent", filter: { attacking: true, type: "creature" } }],
  effect: { kind: "exile", target: 0 },
  faces: FACES,
  split: true,
});
