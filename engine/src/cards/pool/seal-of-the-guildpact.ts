import { defineCard } from "../define.js";

// Ravnica Remastered (RVR). EDHREC rank 12578. Two different colours chosen as it enters, one
// after the other (`chooseOnEnterCount: 2`); each spell its controller casts
// costs {1} less for each of them it is (`colorsOf: "priced"` with `chosen`,
// read as the cost is worked out — rule 601.2f), which is nothing off a spell
// of neither. Generic mana only: it can't reduce a coloured requirement.

const COST_TEXT = "Each spell you cast costs {1} less to cast for each of the chosen colors it is.";

export default defineCard({
  name: "Seal of the Guildpact",
  manaCost: "{5}",
  colors: [],
  types: ["artifact"],
  text: `As this artifact enters, choose two colors.\n${COST_TEXT}`,
  chooseOnEnter: ["W", "U", "B", "R", "G"],
  chooseOnEnterCount: 2,
  static: [
    {
      affects: { scope: "self" },
      costModification: {
        applies: {},
        reduceGeneric: { colorsOf: "priced", chosen: true },
        when: { caster: "you" },
      },
      text: COST_TEXT,
    },
  ],
});
