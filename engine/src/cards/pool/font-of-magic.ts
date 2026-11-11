import { defineCard } from "../define.js";

const TEXT =
  "Instant and sorcery spells you cast cost {1} less to cast for each time you've cast a commander from the command zone this game.";

export default defineCard({
  name: "Font of Magic",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      costModification: {
        applies: { typesAnyOf: ["instant", "sorcery"] },
        reduceGeneric: { commanderCasts: "you" },
        when: { caster: "you" },
      },
      text: TEXT,
    },
  ],
});
