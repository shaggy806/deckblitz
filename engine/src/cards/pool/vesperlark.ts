import { defineCard } from "../define.js";

// EDHREC rank 16799.
//
// Rulings:
//   [2019-06-14] The ability that causes you to sacrifice an evoked creature is a triggered
//     ability. Players may respond to this triggered ability while the creature is still on the
//     battlefield.

const LEAVES_TEXT =
  "When this creature leaves the battlefield, return target creature card with power 1 or less from your graveyard to the battlefield.";

export default defineCard({
  name: "Vesperlark",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${LEAVES_TEXT}\nEvoke {1}{W} (You may cast this spell for its evoke cost. If you do, it's sacrificed when it enters.)`,
  evoke: { cost: "{1}{W}" },
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature", power: { op: "lte", n: 1 } } }],
      effect: { kind: "put-onto-battlefield", target: 0 },
      resolve: null,
      text: LEAVES_TEXT,
    },
  ],
});
