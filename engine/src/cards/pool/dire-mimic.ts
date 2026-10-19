import { defineCard } from "../define.js";

const MANA_TEXT = "{T}, Sacrifice this artifact: Add one mana of any color.";
const ANIMATE_TEXT =
  "{3}: This artifact becomes a Shapeshifter artifact creature with base power and toughness 5/5 until end of turn.";

// It stays a Treasure while animated (its ruling: Treasure is an artifact
// type, never a creature type), so the types are added, not set.
export default defineCard({
  name: "Dire Mimic",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Treasure"],
  keywords: ["flash"],
  text: `Flash\n${MANA_TEXT}\n${ANIMATE_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: "self" },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: MANA_TEXT,
    },
    {
      cost: { mana: "{3}", tap: false },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 5,
        toughness: 5,
        addTypes: ["artifact", "creature"],
        addSubtypes: ["Shapeshifter"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: ANIMATE_TEXT,
    },
  ],
});
