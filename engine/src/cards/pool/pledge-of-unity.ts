import { defineCard } from "../define.js";

// EDHREC rank 8607. The life counts the creatures you control as it's gained,
// after the counters went on.

export default defineCard({
  name: "Pledge of Unity",
  manaCost: "{1}{G}{W}",
  colors: ["W", "G"],
  types: ["instant"],
  text: "Put a +1/+1 counter on each creature you control. You gain 1 life for each creature you control.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter-all", filter: { type: "creature", controlledBy: "you" }, counter: "+1/+1", amount: 1 },
      { kind: "gain-life", amount: { countOf: { type: "creature", controlledBy: "you" } } },
    ],
  },
});
