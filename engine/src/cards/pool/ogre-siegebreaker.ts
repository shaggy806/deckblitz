import { defineCard } from "../define.js";

// EDHREC rank 29612.

const TEXT = "{2}{B}{R}: Destroy target creature that was dealt damage this turn.";

export default defineCard({
  name: "Ogre Siegebreaker",
  manaCost: "{2}{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Ogre", "Berserker"],
  power: 4,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}{B}{R}", tap: false },
      targets: [{ kind: "permanent", whose: "any", filter: { type: "creature", damagedThisTurnBy: {} } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
