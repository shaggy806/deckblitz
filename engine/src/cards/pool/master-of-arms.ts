import { defineCard } from "../define.js";

// EDHREC rank 31921.

export default defineCard({
  name: "Master of Arms",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 2,
  keywords: ["first-strike"],
  text: "First strike\n{1}{W}: Tap target creature blocking this creature.",
  activated: [
    {
      cost: { mana: "{1}{W}", tap: false },
      targets: [
        {
          kind: "permanent",
          filter: { type: "creature", blockingRelation: { relation: "blocking" } },
        },
      ],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: "{1}{W}: Tap target creature blocking this creature.",
    },
  ],
});
