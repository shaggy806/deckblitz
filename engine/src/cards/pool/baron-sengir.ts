import { defineCard } from "../define.js";

// EDHREC rank 24897.
//
// Rulings:
//   [2004-10-04] The Baron's ability will only regenerate creatures with type "Vampire,"
//     regardless of whether the creature has "Vampire" in its name.
//   [2007-09-16] Although Baron Sengir is now a Vampire, it still can't regenerate itself.

export default defineCard({
  name: "Baron Sengir",
  manaCost: "{5}{B}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Vampire", "Noble"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: "Flying\nWhenever a creature dealt damage by Baron Sengir this turn dies, put a +2/+2 counter on Baron Sengir.\n{T}: Regenerate another target Vampire.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "other", of: { kind: "permanent", filter: { subtype: "Vampire" } } }],
      effect: { kind: "regenerate", target: 0 },
      resolve: null,
      text: "{T}: Regenerate another target Vampire.",
    },
  ],
  triggered: [
    {
      trigger: {
        on: "dies",
        who: "any",
        filter: { type: "creature", damagedThisTurnBy: { source: "this" } },
      },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+2/+2", amount: 1 },
      resolve: null,
      text: "Whenever a creature dealt damage by Baron Sengir this turn dies, put a +2/+2 counter on Baron Sengir.",
    },
  ],
});
