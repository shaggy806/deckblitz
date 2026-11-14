import { defineCard } from "../define.js";
import { visit } from "../helpers.js";

// An Attraction (rule 717): it starts in its owner's Attraction deck, and goes
// to their junkyard rather than a graveyard, hand or library (717.6).

const VISIT = "Scry 1.";

export default defineCard({
  name: "Fortune Teller",
  types: ["artifact"],
  subtypes: ["Attraction"],
  text: `Visit — ${VISIT}`,
  attractionLights: [
    { collector: "212a", lights: [2, 3, 6] },
    { collector: "212b", lights: [2, 4, 6] },
    { collector: "212c", lights: [2, 5, 6] },
    { collector: "212d", lights: [3, 4, 6] },
    { collector: "212e", lights: [3, 5, 6] },
    { collector: "212f", lights: [4, 5, 6] },
  ],
  triggered: [
    visit(
      { kind: "scry", amount: 1 },
      VISIT,
    ),
  ],
});
