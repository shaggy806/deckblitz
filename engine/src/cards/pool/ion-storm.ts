import { defineCard } from "../define.js";

// Ice Age (ICE). EDHREC rank 20818.
//
// The counter comes off any permanent you control, of either kind, chosen as
// the cost is paid.
export default defineCard({
  name: "Ion Storm",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: "{1}{R}, Remove a +1/+1 counter or a charge counter from a permanent you control: This enchantment deals 2 damage to any target.",
  activated: [
    {
      cost: { mana: "{1}{R}", tap: false, removeCounter: { kind: "+1/+1", orKinds: ["charge"], count: 1, from: {} } },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: "{1}{R}, Remove a +1/+1 counter or a charge counter from a permanent you control: This enchantment deals 2 damage to any target.",
    },
  ],
});
