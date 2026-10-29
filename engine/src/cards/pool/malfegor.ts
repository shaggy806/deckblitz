import { defineCard } from "../define.js";

// EDHREC rank 14681.
//
// Rulings:
//   [2017-11-17] After you discard your hand and the number of creatures each opponent must
//     sacrifice has been determined, each opponent in turn order, starting with the player whose
//     turn it is if that player is your opponent, chooses which creatures they will sacrifice,
//     then all the chosen creatures are all sacrificed at the same time.
//   [2017-11-17] Malfegor's ability is not optional. You must discard your entire hand no matter
//     how many creatures your opponents control.

const TEXT =
  "When Malfegor enters, discard your hand. Each opponent sacrifices a creature of their choice for each card discarded this way.";

export default defineCard({
  name: "Malfegor",
  manaCost: "{2}{B}{B}{R}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Demon", "Dragon"],
  power: 6,
  toughness: 6,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard-hand", who: "you" },
          {
            kind: "sacrifice",
            who: "each-opponent",
            filter: { type: "creature" },
            count: { thisWay: "discarded", who: "you" },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
