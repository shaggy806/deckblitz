import { defineCard } from "../define.js";

// Future Sight (FUT). EDHREC rank 15928.

const TEXT = "As long as this creature is tapped, creature spells you cast cost {2} less to cast.";

export default defineCard({
  name: "Centaur Omenreader",
  manaCost: "{3}{G}",
  colors: ["G"],
  supertypes: ["snow"],
  types: ["creature"],
  subtypes: ["Centaur", "Shaman"],
  power: 3,
  toughness: 3,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { tapped: true } },
      costModification: { applies: { type: "creature" }, caster: "you", reduceGeneric: 2 },
      text: TEXT,
    },
  ],
});
