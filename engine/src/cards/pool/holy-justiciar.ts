import { defineCard } from "../define.js";

// EDHREC rank 31600.
//
// Rulings:
//   [2012-05-01] If the creature is an untapped Zombie, it will become tapped, then exiled.
const TEXT = "{2}{W}, {T}: Tap target creature. If that creature is a Zombie, exile it.";

export default defineCard({
  name: "Holy Justiciar",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}{W}", tap: true },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          {
            kind: "conditional",
            condition: { kind: "target", index: 0, filter: { subtype: "Zombie" } },
            then: { kind: "exile", target: 0 },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
