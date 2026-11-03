import { defineCard } from "../define.js";

const TEXT = "Black spells you cast cost {B} more to cast.";

export default defineCard({
  name: "Derelor",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Thrull"],
  power: 4,
  toughness: 4,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: { colors: ["B"] }, caster: "you", increaseColored: "{B}" },
      text: TEXT,
    },
  ],
});
