import { defineCard } from "../define.js";

// EDHREC rank 29706.
//
// Rulings:
//   [2004-10-04] Since tapping is not part of the cost, you can use this more than once a turn.
//
// The token carries its own "bands with other creatures named Wolves of the
// Hunt" (`tokens/wolves-of-the-hunt.ts`, rule 702.22b).
const TEXT =
  '{2}{G}{G}: Create a 1/1 green Wolf creature token named Wolves of the Hunt. It has "bands with other creatures named Wolves of the Hunt."';

export default defineCard({
  name: "Master of the Hunt",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}{G}{G}", tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Wolves of the Hunt", count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
