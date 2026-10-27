import { defineCard } from "../define.js";

// EDHREC rank 13832. Kadena, Slinking Sorcerer's face-down cost reduction,
// without its once-each-turn limit.

const TEXT = "Face-down creature spells you cast cost {1} less to cast.";

export default defineCard({
  name: "Dream Chisel",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      costModification: {
        applies: { type: "creature", faceDown: true },
        caster: "you",
        reduceGeneric: 1,
      },
      text: TEXT,
    },
  ],
});
