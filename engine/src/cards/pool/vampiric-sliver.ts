import { defineCard } from "../define.js";

// Rulings:
//   If Vampiric Sliver is put into a graveyard from the battlefield at the same time as a creature
//     dealt damage by another Sliver, the Vampiric Sliver's ability will trigger for the other
//     Sliver. That Sliver will get a +1/+1 counter.
//   If a Sliver doesn't have this ability when it deals damage, but does have it when the damaged
//     creature is put into a graveyard, the ability will trigger.
//   If a Sliver has this ability when it deals damage, but not when the damaged creature is put
//     into a graveyard, nothing happens.

const GRANTED = "Whenever a creature dealt damage by this creature this turn dies, put a +1/+1 counter on this creature.";
const TEXT = `All Sliver creatures have "${GRANTED}"`;

export default defineCard({
  name: "Vampiric Sliver",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Sliver"],
  power: 3,
  toughness: 3,
  text: TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", subtype: "Sliver" } },
      grantsTriggered: [
        {
          trigger: { on: "dies", who: "any", filter: { type: "creature", damagedThisTurnBy: { source: "this" } } },
          targets: [],
          effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          resolve: null,
          text: GRANTED,
        },
      ],
      text: TEXT,
    },
  ],
});
