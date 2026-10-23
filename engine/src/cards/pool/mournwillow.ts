import { defineCard } from "../define.js";

// EDHREC rank 25611.
//
// Rulings:
//   [2016-07-13] Because the last ability's effect doesn't change the characteristics of any
//     permanents, the set of creatures affected is constantly updated. Any creature with power 2
//     or less at the moment blockers are chosen will be unable to block.
//
// Temur Charm's `restrict` over a filter: a rule for the rest of the turn,
// matched as blockers are declared (rule 611.2c), so it reads power then.

const TEXT =
  "Delirium — When this creature enters, if there are four or more card types among cards in your graveyard, creatures with power 2 or less can't block this turn.";

export default defineCard({
  name: "Mournwillow",
  manaCost: "{1}{B}{G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Plant", "Skeleton"],
  power: 3,
  toughness: 2,
  keywords: ["haste"],
  text: `Haste\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "delirium" },
      targets: [],
      effect: {
        kind: "restrict",
        filter: { type: "creature", power: { op: "lte", n: 2 } },
        restrictions: ["cant-block"],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
