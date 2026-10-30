import { defineCard } from "../define.js";

// EDHREC rank 15638.

export default defineCard({
  name: "Awe Strike",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "The next time target creature would deal damage this turn, prevent that damage. You gain life equal to the damage prevented this way.",
  targets: ["creature"],
  effect: { kind: "damage-rule", by: { target: 0 }, amount: "next-time", gainLifePrevented: true },
});
