import { defineCard } from "../define.js";

const TEXT =
  "As long as you've cast an instant or sorcery spell this turn, this creature can attack as though it didn't have defender.";

export default defineCard({
  name: "Piston-Fist Cyclops",
  manaCost: "{1}{U/R}{U/R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Cyclops"],
  power: 4,
  toughness: 3,
  keywords: ["defender"],
  text: `Defender\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "cast-this-turn", filter: { typesAnyOf: ["instant", "sorcery"] } },
      canAttackAsThoughNoDefender: true,
      text: TEXT,
    },
  ],
});
