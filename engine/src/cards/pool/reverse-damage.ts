import { defineCard } from "../define.js";

// EDHREC rank 18976. Only the source's next damage to you this turn (the ruling).

export default defineCard({
  name: "Reverse Damage",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "The next time a source of your choice would deal damage to you this turn, prevent that damage. You gain life equal to the damage prevented this way.",
  targets: [],
  effect: { kind: "prevent-damage-from-chosen-source", to: "you", amount: "next-time", gainLifePrevented: true },
});
