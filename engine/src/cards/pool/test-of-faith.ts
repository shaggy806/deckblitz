import { defineCard } from "../define.js";

// EDHREC rank 27570.
//
// Rulings:
//   The +1/+1 counters are put onto the creature at the same time the damage is prevented. If a
//   1/1 creature would be dealt 6 damage, 3 damage is prevented and three +1/+1 counters are put
//   on the creature. The creature ends up as a 4/4 creature with 3 damage marked on it.
//
// - Temper with a fixed 3.
export default defineCard({
  name: "Test of Faith",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Prevent the next 3 damage that would be dealt to target creature this turn. For each 1 damage prevented this way, put a +1/+1 counter on that creature.",
  targets: ["creature"],
  effect: {
    kind: "damage-rule",
    to: { target: 0 },
    amount: 3,
    then: { kind: "add-counter", target: 0, counter: "+1/+1", amount: "x" },
  },
});
