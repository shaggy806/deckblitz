import { defineCard } from "../define.js";
import { distinctTargets } from "../helpers.js";

export default defineCard({
  name: "Lead by Example",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Support 2. (Put a +1/+1 counter on each of up to two target creatures.)",
  // Support on an instant or sorcery (rule 701.41b): "up to N target
  // creatures", no "other".
  targets: distinctTargets(2, "creature", { optional: true }),
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      { kind: "add-counter", target: 1, counter: "+1/+1", amount: 1 },
    ],
  },
});
