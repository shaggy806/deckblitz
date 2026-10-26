import { defineCard } from "../define.js";

// EDHREC rank 23648. Shards of Alara.
//
// Rulings:
//   [2008-10-01] The first ability has an "intervening 'if' clause": it checks on trigger and
//     again on resolution (the trigger's `condition`, Drumhunter's shape).

export default defineCard({
  name: "Sunseed Nurturer",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Druid", "Wizard"],
  power: 1,
  toughness: 1,
  text: "At the beginning of your end step, if you control a creature with power 5 or greater, you may gain 2 life.\n{T}: Add {C}.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "controls", filter: { type: "creature", power: { op: "gte", n: 5 } }, atLeast: 1 },
      targets: [],
      effect: { kind: "may", prompt: "Gain 2 life?", effect: { kind: "gain-life", amount: 2 } },
      resolve: null,
      text: "At the beginning of your end step, if you control a creature with power 5 or greater, you may gain 2 life.",
    },
  ],
});
