import { defineCard } from "../define.js";

export default defineCard({
  name: "Hold at Bay",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Prevent the next 7 damage that would be dealt to any target this turn.",
  targets: ["any-target"],
  effect: { kind: "prevent-damage", target: 0, amount: 7 },
});
