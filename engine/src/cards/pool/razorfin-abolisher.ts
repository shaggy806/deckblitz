import { defineCard } from "../define.js";

// Eventide (EVE). EDHREC rank 27950.
//
// Rulings:
//   If the targeted creature no longer has any counters on it as the ability resolves, its
//   only target is illegal and it doesn't resolve. Any kind of counter counts.
//
// `counters` with no `kind` counts every counter of every kind.

export default defineCard({
  name: "Razorfin Abolisher",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 2,
  toughness: 2,
  text: "{1}{U}, {T}: Return target creature with a counter on it to its owner's hand.",
  activated: [
    {
      cost: { mana: "{1}{U}", tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", counters: { compare: { op: "gte", n: 1 } } } }],
      effect: { kind: "return-to-hand", target: 0 },
      resolve: null,
      text: "{1}{U}, {T}: Return target creature with a counter on it to its owner's hand.",
    },
  ],
});
