import { defineCard } from "../define.js";

// EDHREC rank 10663. "Remove those counters, transform it, then untap it" is
// the same permanent throughout: a permanent that transforms doesn't become a
// new object (rule 712.18), so "untap it" is Creeping Inn. Rule 701.27f is
// built into `transform`.
const MANA_TEXT = "{T}: Add {C}.";
const SOUL_TEXT =
  "{1}, {T}, Sacrifice a creature: Put a soul counter on this land. Then if there are three or more soul counters on it, remove those counters, transform it, then untap it. Activate only as a sorcery.";

export default defineCard({
  name: "Hostile Hostel",
  colors: [],
  types: ["land"],
  text: `${MANA_TEXT}\n${SOUL_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: MANA_TEXT,
    },
    {
      cost: { mana: "{1}", tap: true, sacrifice: "creature-you-control" },
      sorcerySpeed: true,
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "soul", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "self-counters", counter: "soul", compare: { op: "gte", n: 3 } },
            then: {
              kind: "sequence",
              effects: [
                { kind: "remove-counter", target: "source", counter: "soul", amount: { countersOn: "source", counter: "soul" } },
                { kind: "transform", target: "source" },
                { kind: "untap", target: "source" },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: SOUL_TEXT,
    },
  ],
  faces: ["Hostile Hostel", "Creeping Inn"],
  transform: true,
});
