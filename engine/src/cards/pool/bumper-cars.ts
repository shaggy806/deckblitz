import { defineCard } from "../define.js";
import { visit } from "../helpers.js";

// An Attraction (rule 717): it starts in its owner's Attraction deck, and goes
// to their junkyard rather than a graveyard, hand or library (717.6).

const VISIT = "Target creature must be blocked this turn if able.";

export default defineCard({
  name: "Bumper Cars",
  types: ["artifact"],
  subtypes: ["Attraction"],
  text: `Visit — ${VISIT}`,
  attractionLights: [
    { collector: "202a", lights: [2, 3, 6] },
    { collector: "202b", lights: [2, 4, 6] },
    { collector: "202c", lights: [2, 5, 6] },
    { collector: "202d", lights: [3, 4, 6] },
    { collector: "202e", lights: [3, 5, 6] },
    { collector: "202f", lights: [4, 5, 6] },
  ],
  triggered: [
    visit(
      { kind: "restrict", target: 0, restrictions: ["must-be-blocked-if-able"] },
      VISIT,
      ["creature"],
    ),
  ],
});
