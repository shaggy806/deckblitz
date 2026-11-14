import { defineCard } from "../define.js";
import { visit } from "../helpers.js";

// An Attraction (rule 717): it starts in its owner's Attraction deck, and goes
// to their junkyard rather than a graveyard, hand or library (717.6).

const VISIT = "Create a 1/1 white Clown Robot artifact creature token.";

export default defineCard({
  name: "Clown Extruder",
  types: ["artifact"],
  subtypes: ["Attraction"],
  text: `Visit — ${VISIT}`,
  attractionLights: [
    { collector: "204a", lights: [2, 6] },
    { collector: "204b", lights: [3, 6] },
    { collector: "204c", lights: [4, 6] },
    { collector: "204d", lights: [5, 6] },
  ],
  triggered: [
    visit(
      { kind: "create-token", token: "Clown Robot Token", count: 1 },
      VISIT,
    ),
  ],
});
