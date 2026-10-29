import { defineCard } from "../define.js";

export default defineCard({
  name: "Hallow",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Prevent all damage target spell would deal this turn. You gain life equal to the damage prevented this way.",
  targets: ["spell"],
  effect: { kind: "damage-rule", by: { target: 0 }, gainLifePrevented: true },
});
