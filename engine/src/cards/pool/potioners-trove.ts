import { defineCard } from "../define.js";

// EDHREC rank 10924.
const MANA_TEXT = "{T}: Add one mana of any color.";
const LIFE_TEXT = "{T}: You gain 2 life. Activate only if you've cast an instant or sorcery spell this turn.";

export default defineCard({
  name: "Potioner's Trove",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `${MANA_TEXT}\n${LIFE_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: MANA_TEXT,
    },
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "gain-life", amount: 2 },
      condition: { kind: "cast-this-turn", filter: { typesAnyOf: ["instant", "sorcery"] } },
      resolve: null,
      text: LIFE_TEXT,
    },
  ],
});
