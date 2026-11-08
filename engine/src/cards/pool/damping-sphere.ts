import { defineCard } from "../define.js";

const LAND_TEXT = "If a land is tapped for two or more mana, it produces {C} instead of any other type and amount.";
const COST_TEXT = "Each spell a player casts costs {1} more to cast for each other spell that player has cast this turn.";

// EDHREC rank 4969. Rules 106.12b and 616.1: of several replacements the tapper
// picks an order (the ruling); the engine reads "two or more" before any
// multiplier, which leaves the tapper the most mana.
export default defineCard({
  name: "Damping Sphere",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: `${LAND_TEXT}\n${COST_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      manaProduction: [{ filter: { type: "land" }, produces: "C", tapper: "any", one: true, atLeast: 2 }],
      text: LAND_TEXT,
    },
    {
      affects: { scope: "self" },
      costModification: { applies: {}, increasePerOtherSpellByCaster: 1 },
      text: COST_TEXT,
    },
  ],
});
