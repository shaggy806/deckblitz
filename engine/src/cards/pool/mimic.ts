import { defineCard } from "../define.js";

// EDHREC rank 19006. Dire Mimic's shape.
//
// Rulings:
//   [2021-07-23] Mimic is still a Treasure after its last ability resolves, but Treasure is an
//     artifact type, never a creature type.
//   [2021-07-23] If an effect refers to a Treasure, it means any Treasure artifact, not just a
//     Treasure artifact token.

const MANA_TEXT = "{T}, Sacrifice this artifact: Add one mana of any color.";
const ANIMATE_TEXT =
  "{2}: This artifact becomes a Shapeshifter artifact creature with base power and toughness 3/3 until end of turn.";

export default defineCard({
  name: "Mimic",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Treasure"],
  text: `${MANA_TEXT}\n${ANIMATE_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: "self" },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: MANA_TEXT,
    },
    {
      cost: { mana: "{2}", tap: false },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 3,
        toughness: 3,
        addTypes: ["artifact", "creature"],
        addSubtypes: ["Shapeshifter"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: ANIMATE_TEXT,
    },
  ],
});
