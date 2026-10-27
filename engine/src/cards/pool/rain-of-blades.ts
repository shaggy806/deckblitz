import { defineCard } from "../define.js";

// Scourge (SCG). EDHREC rank 26962.

export default defineCard({
  name: "Rain of Blades",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Rain of Blades deals 1 damage to each attacking creature.",
  targets: [],
  effect: { kind: "damage-all", amount: 1, filter: { type: "creature", attacking: true } },
});
