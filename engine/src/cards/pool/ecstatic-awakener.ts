import { defineCard } from "../define.js";

// EDHREC rank 17249. The back face is Awoken Demon, a vanilla 4/4.
const TEXT =
  "{2}{B}, Sacrifice another creature: Draw a card, then transform this creature. Activate only once each turn.";

export default defineCard({
  name: "Ecstatic Awakener",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}{B}", tap: false, sacrifice: "creature-you-control" },
      otherOnly: true,
      oncePerTurn: true,
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "transform", target: "source" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Ecstatic Awakener", "Awoken Demon"],
  transform: true,
});
