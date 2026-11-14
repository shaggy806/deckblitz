import { defineCard } from "../define.js";
import { visit } from "../helpers.js";

// An Attraction (rule 717): it starts in its owner's Attraction deck, and goes
// to their junkyard rather than a graveyard, hand or library (717.6).

const VISIT = "Tap target creature an opponent controls.";

export default defineCard({
  name: "Spinny Ride",
  types: ["artifact"],
  subtypes: ["Attraction"],
  text: `Visit — ${VISIT}`,
  attractionLights: [
    { collector: "227a", lights: [2, 3, 6] },
    { collector: "227b", lights: [2, 4, 6] },
    { collector: "227c", lights: [2, 5, 6] },
    { collector: "227d", lights: [3, 4, 6] },
    { collector: "227e", lights: [3, 5, 6] },
    { collector: "227f", lights: [4, 5, 6] },
  ],
  triggered: [
    visit(
      { kind: "tap", target: 0 },
      VISIT,
      ["creature-an-opponent-controls"],
    ),
  ],
});
