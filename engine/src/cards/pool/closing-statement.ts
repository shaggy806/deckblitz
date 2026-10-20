import { defineCard } from "../define.js";

// EDHREC rank 19673.

export default defineCard({
  name: "Closing Statement",
  manaCost: "{3}{W}{B}",
  colors: ["W", "B"],
  types: ["instant"],
  text: "This spell costs {2} less to cast during your end step.\nDestroy target creature or planeswalker you don't control. Put a +1/+1 counter on up to one target creature you control.",
  selfCostReduction: {
    condition: {
      kind: "all",
      of: [{ kind: "your-turn" }, { kind: "turn-structure", steps: ["end"] }],
    },
    reduceGeneric: 2,
  },
  targets: [
    { kind: "permanent", whose: "opponent", filter: { typesAnyOf: ["creature", "planeswalker"] } },
    { kind: "optional", of: "creature-you-control" },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      { kind: "add-counter", target: 1, counter: "+1/+1", amount: 1 },
    ],
  },
});
