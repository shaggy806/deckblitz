import { defineCard } from "../define.js";

// EDHREC rank 7138.

const TEXT = "Dinosaur spells you cast cost {2} less to cast.";

export default defineCard({
  name: "Knight of the Stampede",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 4,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: { subtype: "Dinosaur" }, caster: "you", reduceGeneric: 2 },
      text: TEXT,
    },
  ],
});
