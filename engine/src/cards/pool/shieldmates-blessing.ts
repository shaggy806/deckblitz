import { defineCard } from "../define.js";

export default defineCard({
  name: "Shieldmate's Blessing",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Prevent the next 3 damage that would be dealt to any target this turn.",
  targets: ["any-target"],
  effect: { kind: "prevent-damage", target: 0, amount: 3 },
});
