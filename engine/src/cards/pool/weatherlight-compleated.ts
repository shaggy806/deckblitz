import { defineCard } from "../define.js";

// EDHREC rank 9814.
//
// Rulings:
//   If Weatherlight Compleated loses its abilities, the type-changing effect of its second ability
//     will continue to apply to it. This is because effects that change an object's types are
//     always applied before effects that remove abilities. In that case, if it has four or more
//     phyresis counters on it, it will be a legendary Phyrexian Vehicle artifact creature with no
//     abilities. This is true even if it somehow gained its fourth phyresis counter after losing
//     its abilities.
//   If Weatherlight Compleated is a creature and dies, its last ability will trigger.
//   If more than one creature dies at the same time, Weatherlight Compleated's triggered ability
//     will trigger once for each of those creatures. As each of those resolve, its controller will
//     take the instructed actions. For example, if it has no phyresis counters on it and seven
//     creatures die, its controller will put a counter on it and scry 1 as each of the first six
//     instances of the ability resolve, then put a counter on it and draw a card as the last
//     instance resolves.
//   If Weatherlight Compleated has left the battlefield by the time its triggered ability
//     resolves, you won't be able to add any counters to it. Whether you draw a card or scry 1
//     will be determined by the number of counters it had on it before it left the battlefield.
//
// A Vehicle with no crew ability. The type change is a layer-4 effect, so it
// keeps applying once it has started even if the ability is removed later
// (rule 613.6). The draw-or-scry check reads its counters after the new one
// goes on, or as it last existed once it has left (`self-counters`).
const TYPE_TEXT =
  "As long as Weatherlight Compleated has four or more phyresis counters on it, it's a Phyrexian creature in addition to its other types.";
const DIES_TEXT =
  "Whenever a creature you control dies, put a phyresis counter on Weatherlight Compleated. Then draw a card if it has seven or more phyresis counters on it. If it doesn't, scry 1.";

export default defineCard({
  name: "Weatherlight Compleated",
  manaCost: "{2}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${TYPE_TEXT}\n${DIES_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "self-counters", counter: "phyresis", compare: { op: "gte", n: 4 } },
      addTypes: ["creature"],
      addSubtypes: ["Phyrexian"],
      text: TYPE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "phyresis", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "self-counters", counter: "phyresis", compare: { op: "gte", n: 7 } },
            then: { kind: "draw", amount: 1 },
            else: { kind: "scry", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
