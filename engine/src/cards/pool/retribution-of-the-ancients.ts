import { defineCard } from "../define.js";

// EDHREC rank 6755.
//
// X is announced as it's activated, up to the +1/+1 counters among your
// creatures; which creatures give them is chosen as the cost is paid.

export default defineCard({
  name: "Retribution of the Ancients",
  manaCost: "{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: "{B}, Remove X +1/+1 counters from among creatures you control: Target creature gets -X/-X until end of turn.",
  activated: [
    {
      cost: {
        mana: "{B}",
        tap: false,
        removeCounter: { kind: "+1/+1", count: "x", from: { type: "creature" }, among: true },
      },
      targets: ["creature"],
      effect: {
        kind: "modify-pt",
        target: 0,
        power: { product: ["x", -1] },
        toughness: { product: ["x", -1] },
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{B}, Remove X +1/+1 counters from among creatures you control: Target creature gets -X/-X until end of turn.",
    },
  ],
});
