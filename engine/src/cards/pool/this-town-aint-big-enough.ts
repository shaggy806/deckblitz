import { defineCard } from "../define.js";

// EDHREC rank 9000.
//
// "Up to two" — both slots optional, the second another permanent than the
// first (Marang River Regent's shape, without "other"), returned together as
// one event. The cost is fixed once targets are chosen (rule 601.2f): {3}
// less when one of them is a permanent the caster controls.
const RETURN_TEXT = "Return up to two target nonland permanents to their owners' hands.";

export default defineCard({
  name: "This Town Ain't Big Enough",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["instant"],
  text: `This spell costs {3} less to cast if it targets a permanent you control.\n${RETURN_TEXT}`,
  targetCostReduction: { filter: { controlledBy: "you" }, reduceGeneric: 3 },
  targets: [
    { kind: "optional", of: "nonland-permanent" },
    { kind: "optional", of: { kind: "other", of: "nonland-permanent", than: { slots: [0] } } },
  ],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "return-to-hand", target: 0 },
      { kind: "return-to-hand", target: 1 },
    ],
  },
});
