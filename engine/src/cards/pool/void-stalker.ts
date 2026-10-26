import { defineCard } from "../define.js";

// Rulings:
//   [2012-07-01] You can activate Void Stalker's ability targeting a creature you control,
//     including Void Stalker itself. In that case, only you will shuffle your library.
//   [2012-07-01] If Void Stalker leaves the battlefield before its ability resolves, the target
//     creature will be shuffled into its owner's library but Void Stalker will remain wherever it
//     is.
//   [2012-07-01] If the target creature is an illegal target when the ability tries to resolve, it
//     won't resolve and none of its effects will happen.
//
// "Put on top, then shuffle" is a shuffle into the library: both move as one
// instruction (Floodpits Drowner's shape).

const TEXT =
  "{2}{U}, {T}: Put this creature and target creature on top of their owners' libraries, then those players shuffle their libraries.";

export default defineCard({
  name: "Void Stalker",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 2,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}{U}", tap: true },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "shuffle-into-library", target: "source" },
          { kind: "shuffle-into-library", target: 0 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
