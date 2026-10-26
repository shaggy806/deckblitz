import { defineCard } from "../define.js";

// EDHREC rank 26974. Future Sight.
//
// Ogre Siegebreaker's target: a creature dealt damage this turn by any
// source — prevented damage isn't dealt, and a regenerated creature was
// still dealt it (the rulings).

export default defineCard({
  name: "Witch's Mist",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: "{2}{B}, {T}: Destroy target creature that was dealt damage this turn.",
  activated: [
    {
      cost: { mana: "{2}{B}", tap: true },
      targets: [{ kind: "permanent", whose: "any", filter: { type: "creature", damagedThisTurnBy: {} } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "{2}{B}, {T}: Destroy target creature that was dealt damage this turn.",
    },
  ],
});
