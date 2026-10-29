import { defineCard } from "../define.js";

// EDHREC rank 16306.
//
// "One or more": X is announced as it's activated, at least 1 and up to the
// +1/+1 counters among your creatures; which creatures give them is chosen as
// the cost is paid. The token is X/X for the X removed.

export default defineCard({
  name: "Ooze Flux",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: "{1}{G}, Remove one or more +1/+1 counters from among creatures you control: Create an X/X green Ooze creature token, where X is the number of +1/+1 counters removed this way.",
  activated: [
    {
      cost: { mana: "{1}{G}", tap: false, removeCounter: { kind: "+1/+1", count: "x", from: { type: "creature" }, among: true } },
      minX: 1,
      targets: [],
      effect: { kind: "create-token", token: "Ooze Token (Convert to Slime)", count: 1, basePt: { power: "x", toughness: "x" } },
      resolve: null,
      text: "{1}{G}, Remove one or more +1/+1 counters from among creatures you control: Create an X/X green Ooze creature token, where X is the number of +1/+1 counters removed this way.",
    },
  ],
});
