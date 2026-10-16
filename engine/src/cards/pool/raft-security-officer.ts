import { defineCard } from "../define.js";

// EDHREC rank 27072. Marvel Super Heroes.
//
// "This ability costs {1} less to activate if it targets a creature with
// power 3 or less" is the ability's `targetCostReduction`: the cost is fixed
// as the target is chosen (rule 601.2f), so a creature pumped past 3 power
// in response is still tapped — the {1} was already saved.

const TAP_TEXT =
  "{2}, {T}: Tap target creature. This ability costs {1} less to activate if it targets a creature with power 3 or less.";

export default defineCard({
  name: "Raft Security Officer",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 3,
  text: TAP_TEXT,
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: ["creature"],
      targetCostReduction: { filter: { type: "creature", power: { op: "lte", n: 3 } }, reduceGeneric: 1 },
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: TAP_TEXT,
    },
  ],
});
