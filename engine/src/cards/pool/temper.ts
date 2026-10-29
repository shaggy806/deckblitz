import { defineCard } from "../define.js";

// EDHREC rank 29635.
//
// Rulings:
//   [2004-10-04] You can make X be larger than the amount of damage, but you only get one counter
//     for each actual point of damage prevented.
//   [2004-10-04] The +1/+1 counters do show up at the same time as any unprevented damage, which
//     means they are there before you check for lethal damage.

export default defineCard({
  name: "Temper",
  manaCost: "{X}{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Prevent the next X damage that would be dealt to target creature this turn. For each 1 damage prevented this way, put a +1/+1 counter on that creature.",
  targets: ["creature"],
  effect: {
    kind: "damage-rule",
    to: { target: 0 },
    amount: "x",
    then: { kind: "add-counter", target: 0, counter: "+1/+1", amount: "x" },
  },
});
