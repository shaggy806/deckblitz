import { defineCard } from "../define.js";
import { crew, crewText } from "../helpers.js";

// EDHREC rank 13521.
const ENTER = "When this Vehicle enters, it becomes an artifact creature until end of turn.";

export default defineCard({
  name: "Fleetwheel Cruiser",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 5,
  toughness: 3,
  keywords: ["trample", "haste"],
  text: `Trample, haste\n${ENTER}\n${crewText(2)}`,
  activated: [crew(2, crewText(2))],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "add-types", target: "source", addTypes: ["artifact", "creature"], duration: "end-of-turn" },
      resolve: null,
      text: ENTER,
    },
  ],
});
