import { defineCard } from "../define.js";
import { crew, crewText } from "../helpers.js";

// A Vehicle is only a Vehicle creature once crewed, so what its type grant
// reaches depends on the crewing (rule 613.8a), whatever their timestamps.

const TYPE_TEXT = "Vehicle creatures you control are the chosen creature type in addition to their other types.";
const PUMP_TEXT = "Each creature you control of the chosen type other than this Vehicle gets +1/+1.";

export default defineCard({
  name: "Lifecraft Engine",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 4,
  toughness: 4,
  chooseCreatureTypeOnEnter: true,
  text: `As this Vehicle enters, choose a creature type.\n${TYPE_TEXT}\n${PUMP_TEXT}\n${crewText(3)}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", subtype: "Vehicle", controlledBy: "you" } },
      addsChosenCreatureType: true,
      text: TYPE_TEXT,
    },
    {
      affects: {
        scope: "filter",
        filter: { type: "creature", controlledBy: "you", ofChosenType: true },
        excludeSelf: true,
      },
      grantPt: [1, 1],
      text: PUMP_TEXT,
    },
  ],
  activated: [crew(3, crewText(3))],
});
