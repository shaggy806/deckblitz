import { defineCard } from "../define.js";

// Temper's shape, for all the damage this turn: the counters come as each hit
// is prevented (rule 615.5).
export default defineCard({
  name: "Brace for Impact",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Prevent all damage that would be dealt to target multicolored creature this turn. For each 1 damage prevented this way, put a +1/+1 counter on that creature.",
  targets: [{ kind: "permanent", whose: "any", filter: { type: "creature", multicolored: true } }],
  effect: {
    kind: "damage-rule",
    to: { target: 0 },
    then: { kind: "add-counter", target: 0, counter: "+1/+1", amount: "x" },
  },
});
