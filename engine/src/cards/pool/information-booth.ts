import { defineCard } from "../define.js";
import { visit } from "../helpers.js";

// An Attraction (rule 717): it starts in its owner's Attraction deck, and goes
// to their junkyard rather than a graveyard, hand or library (717.6).

const VISIT = "Draw a card.";

export default defineCard({
  name: "Information Booth",
  types: ["artifact"],
  subtypes: ["Attraction"],
  text: `Visit — ${VISIT}`,
  attractionLights: [
    { collector: "218a", lights: [2, 6] },
    { collector: "218b", lights: [3, 6] },
    { collector: "218c", lights: [4, 6] },
    { collector: "218d", lights: [5, 6] },
  ],
  triggered: [
    visit(
      { kind: "draw", amount: 1 },
      VISIT,
    ),
  ],
});
