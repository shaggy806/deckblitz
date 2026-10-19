import { defineCard } from "../define.js";
import { crew, crewText } from "../helpers.js";

const SAC_TEXT = "Sacrifice a Treasure: This Vehicle becomes an artifact creature until end of turn.";

export default defineCard({
  name: "Capenna Express",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 6,
  toughness: 6,
  text: `${SAC_TEXT}\n${crewText(3)}`,
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: { filter: { subtype: "Treasure" } } },
      targets: [],
      effect: { kind: "add-types", target: "source", addTypes: ["artifact", "creature"], duration: "end-of-turn" },
      resolve: null,
      text: SAC_TEXT,
    },
    crew(3),
  ],
});
