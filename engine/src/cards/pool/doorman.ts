import { defineCard } from "../define.js";

// EDHREC rank 28247.
//
// "Creatures with power 2 or less and/or Walls" is one block filter with an
// "or" (`anyOf`), read as blockers are declared — a rule on the creature for
// the turn, not an ability it gains (`restrict`'s `cantBeBlockedBy`).

const TEXT = "{T}: Until end of turn, target creature can't be blocked by creatures with power 2 or less and/or Walls.";

export default defineCard({
  name: "Doorman",
  manaCost: "{1}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Mutant", "Hero"],
  power: 2,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["creature"],
      effect: {
        kind: "restrict",
        target: 0,
        restrictions: [],
        cantBeBlockedBy: { anyOf: [{ power: { op: "lte", n: 2 } }, { subtype: "Wall" }] },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
