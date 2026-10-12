import { defineCard } from "../define.js";

// EDHREC rank 7280. The haste goes to the creature tokens you control as the
// ability resolves (rule 611.2c), not to ones made later this turn.
const CAST_TEXT = "Whenever you cast an artifact spell, create a 1/1 colorless Robot artifact creature token.";
const HASTE_TEXT = "{R}, {T}: Creature tokens you control gain haste until end of turn.";

export default defineCard({
  name: "Ravenous Robots",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["artifact", "creature"],
  subtypes: ["Robot"],
  power: 2,
  toughness: 1,
  text: `${CAST_TEXT}\n${HASTE_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { type: "artifact" } },
      targets: [],
      effect: { kind: "create-token", token: "Robot Token (Big Mother Mouser)", count: 1 },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{R}", tap: true },
      targets: [],
      effect: {
        kind: "grant-keyword-all",
        filter: { type: "creature", token: true, controlledBy: "you" },
        keyword: "haste",
        duration: "end-of-turn",
      },
      resolve: null,
      text: HASTE_TEXT,
    },
  ],
});
