import { defineCard } from "../define.js";

// EDHREC rank 24918.
//
// Rulings:
//   [2004-10-04] This card's effect is always applied in sublayer (b), which means that effects
//     applied in sublayer (c), (d), or (e) will not be overwritten; they will be applied to the
//     new value.
//
// Base toughness alone, for good (`animate` with no `power`, `duration:
// "permanent"` — Wall of Tombstones), from the target's power as it resolves.
const TEXT =
  "{0}: This creature's base toughness becomes equal to 1 plus the power of target creature blocking or blocked by this creature. (This effect lasts indefinitely.)";

export default defineCard({
  name: "Sentinel",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Shapeshifter"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{0}", tap: false },
      targets: [{ kind: "permanent", filter: { type: "creature", blockingRelation: { relation: "either" } } }],
      effect: {
        kind: "animate",
        target: "source",
        toughness: { sum: [1, { powerOf: 0 }] },
        addTypes: [],
        addSubtypes: [],
        duration: "permanent",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
