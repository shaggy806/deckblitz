import { defineCard } from "../define.js";

// EDHREC rank 29324.
//
// Rulings:
//   [2018-04-27] You can activate Drudge Sentinel's ability even if it's already tapped. It will
//     still gain indestructible.
//
// Seasoned Hallowblade's shape, for {3}: no {T} in the cost, so a tapped
// Sentinel can still activate it.

export default defineCard({
  name: "Drudge Sentinel",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Skeleton", "Warrior"],
  power: 2,
  toughness: 1,
  text: "{3}: Tap this creature. It gains indestructible until end of turn. (Damage and effects that say \"destroy\" don't destroy it.)",
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: "source" },
          { kind: "grant-keyword", target: "source", keyword: "indestructible", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "{3}: Tap this creature. It gains indestructible until end of turn.",
    },
  ],
});
