import { defineCard } from "../define.js";

// EDHREC rank 31674.

export default defineCard({
  name: "Jade Leech",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Leech"],
  power: 5,
  toughness: 5,
  text: "Green spells you cast cost {G} more to cast.",
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: { colors: ["G"] }, caster: "you", increaseColored: "{G}" },
      text: "Green spells you cast cost {G} more to cast.",
    },
  ],
});
