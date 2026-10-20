import { defineCard } from "../define.js";

// EDHREC rank 10972.
//
// Rulings:
//   [2021-09-24] Similarly, if you create a token that's a copy of Kurbis, or if a card enters the
//     battlefield as a copy of Kurbis without being cast, it enters with zero +1/+1 counters on
//     it.
//   [2021-09-24] Once the activated ability resolves, damage will be prevented even if the
//     creature later loses all of its +1/+1 counters.
//   [2021-09-24] Kurbis enters with a number of +1/+1 counters on it equal to the total mana spent
//     to cast it, and that number usually won't be the same as X. If you cast Kurbis for {G}{G},
//     it will enter the battlefield with two +1/+1 counters on it.
//
// Dyadrine's counters (`manaSpentOf`, 0 when it wasn't cast). The prevention
// is a shield on the target for the turn (`amount: "all"`), so it holds
// once the counter that let it be targeted is gone.

const ENTERS_TEXT = "Kurbis enters with a number of +1/+1 counters on it equal to the amount of mana spent to cast it.";
const PREVENT_TEXT =
  "Remove a +1/+1 counter from Kurbis: Prevent all damage that would be dealt this turn to another target creature with a +1/+1 counter on it.";

export default defineCard({
  name: "Kurbis, Harvest Celebrant",
  manaCost: "{X}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Treefolk"],
  power: 0,
  toughness: 0,
  text: `${ENTERS_TEXT}\n${PREVENT_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: { manaSpentOf: "source" } } },
      text: ENTERS_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, removeCounter: { kind: "+1/+1", count: 1 } },
      targets: [
        {
          kind: "other",
          of: {
            kind: "permanent",
            filter: { type: "creature", counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } },
          },
        },
      ],
      effect: { kind: "prevent-damage", target: 0, amount: "all" },
      resolve: null,
      text: PREVENT_TEXT,
    },
  ],
});
