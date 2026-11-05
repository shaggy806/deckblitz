import { defineCard } from "../define.js";

// EDHREC rank 21146.

export default defineCard({
  name: "Pay No Heed",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Prevent all damage a source of your choice would deal this turn.",
  effect: { kind: "prevent-damage-from-chosen-source", to: "any", amount: "all" },
});
