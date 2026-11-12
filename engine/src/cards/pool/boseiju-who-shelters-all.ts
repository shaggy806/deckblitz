import { defineCard } from "../define.js";

// EDHREC rank 2764. Hall of the Bandit Lord's shape: the mana carries `spellGains`, here
// `uncounterable` for an instant or sorcery it's spent on — any cost of it (its ruling: a splice
// cost too), the spell stamped as Cavern of Souls' is. The mana itself can pay for anything.
//
// Rulings:
//   The spell can't be countered if the mana produced by Boseiju is spent to cover any cost of the
//     spell, even an additional cost such as a splice cost.
//   Suppose mana produced by Boseiju is spent on a spell and an effect creates a copy of that
//     spell. The copy can be countered, even though the original can't.

const TEXT = "{T}, Pay 2 life: Add {C}. If that mana is spent on an instant or sorcery spell, that spell can't be countered.";

export default defineCard({
  name: "Boseiju, Who Shelters All",
  supertypes: ["legendary"],
  types: ["land"],
  text: `Boseiju enters tapped.\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "Boseiju enters tapped.",
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true, payLife: 2 },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "C",
        amount: 1,
        spellGains: { spell: { typesAnyOf: ["instant", "sorcery"] }, uncounterable: true },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
