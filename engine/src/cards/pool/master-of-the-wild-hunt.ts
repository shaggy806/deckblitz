import { defineCard } from "../define.js";

// Masters 25 (A25). EDHREC rank 8817.
//
// Rulings:
//   If the target creature is an illegal target by the time the ability tries to resolve, it
//     doesn't resolve: no Wolves are tapped, and nothing deals or is dealt damage.
//   Only a Wolf tapped as part of the ability's effect can be dealt damage by the target creature.
//   The target's controller divides its damage as the ability resolves (the Wolves aren't
//     targeted); there's no time to react between the division, the damage and the Wolves dying.
//   All Wolves are tapped by the effect, not as a cost: players may respond by tapping or
//     untapping Wolves, or by creating or removing them.
//
// The Wolves are a `thisWay: "tapped"` filter, each a source of its own dealing
// its damage at once (`each-deals-damage`). The target then deals damage equal
// to its power as it is then, divided among any number of those Wolves by its
// controller as the ability resolves (`damage-distributed`, rule 608.2d — at
// least one each, all of it among them).

const UPKEEP_TEXT = "At the beginning of your upkeep, create a 2/2 green Wolf creature token.";
const HUNT_TEXT =
  "{T}: Tap all untapped Wolf creatures you control. Each Wolf tapped this way deals damage equal to its power to target creature. That creature deals damage equal to its power divided as its controller chooses among any number of those Wolves.";

export default defineCard({
  name: "Master of the Wild Hunt",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Shaman"],
  power: 3,
  toughness: 3,
  text: `${UPKEEP_TEXT}\n${HUNT_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "create-token", token: "Wolf Token", count: 1 },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "tap-all",
            filter: { type: "creature", subtypes: ["Wolf"], controlledBy: "you", tapped: false },
          },
          {
            kind: "each-deals-damage",
            filter: { subtypes: ["Wolf"], thisWay: "tapped" },
            amount: "its-power",
            to: 0,
          },
          {
            kind: "damage-distributed",
            amount: { powerOf: 0 },
            from: 0,
            chooser: { controllerOf: 0 },
            filter: { thisWay: "tapped" },
            among: "those Wolves",
          },
        ],
      },
      resolve: null,
      text: HUNT_TEXT,
    },
  ],
});
