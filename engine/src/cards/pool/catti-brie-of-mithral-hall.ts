import { defineCard } from "../define.js";

// "Remove all +1/+1 counters from Catti-brie" is a cost of `count: "all"`:
// payable with none (its ruling), and the counters it removed are the
// ability's X — "where X is the number of counters removed this way".
export default defineCard({
  name: "Catti-brie of Mithral Hall",
  manaCost: "{G}{W}",
  colors: ["W", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Archer"],
  power: 2,
  toughness: 2,
  keywords: ["reach", "first-strike"],
  text: "Reach, first strike\nWhenever Catti-brie attacks, put a +1/+1 counter on it for each Equipment attached to it.\n{1}, Remove all +1/+1 counters from Catti-brie: It deals X damage to target attacking or blocking creature an opponent controls, where X is the number of counters removed this way.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "add-counter",
        target: "source",
        counter: "+1/+1",
        amount: { countOf: { subtype: "Equipment", attachedTo: { isSource: true } } },
      },
      resolve: null,
      text: "Whenever Catti-brie attacks, put a +1/+1 counter on it for each Equipment attached to it.",
    },
  ],
  activated: [
    {
      cost: { mana: "{1}", tap: false, removeCounter: { kind: "+1/+1", count: "all" } },
      targets: [
        {
          kind: "permanent",
          whose: "opponent",
          filter: { type: "creature", anyOf: [{ attacking: true }, { blocking: true }] },
        },
      ],
      effect: { kind: "damage", amount: "x", target: 0 },
      resolve: null,
      text: "{1}, Remove all +1/+1 counters from Catti-brie: It deals X damage to target attacking or blocking creature an opponent controls, where X is the number of counters removed this way.",
    },
  ],
});
