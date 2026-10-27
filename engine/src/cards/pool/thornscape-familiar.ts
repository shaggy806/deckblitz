import { defineCard } from "../define.js";

// Planeshift (PLS). EDHREC rank 18045.
//
// One static whose filter is "red or white": a red-and-white spell matches it
// once and pays {1} less, not {2} (its ruling).

const TEXT = "Red spells and white spells you cast cost {1} less to cast.";

export default defineCard({
  name: "Thornscape Familiar",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Insect"],
  power: 2,
  toughness: 1,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: { anyOf: [{ colors: ["R"] }, { colors: ["W"] }] }, caster: "you", reduceGeneric: 1 },
      text: TEXT,
    },
  ],
});
