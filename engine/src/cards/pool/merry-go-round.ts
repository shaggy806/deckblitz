import { defineCard } from "../define.js";
import { visit } from "../helpers.js";

// An Attraction (rule 717): it starts in its owner's Attraction deck, and goes
// to their junkyard rather than a graveyard, hand or library (717.6).

const VISIT = "Creatures you control with power 2 or less gain horsemanship until end of turn. (They can't be blocked except by creatures with horsemanship.)";

export default defineCard({
  name: "Merry-Go-Round",
  types: ["artifact"],
  subtypes: ["Attraction"],
  text: `Visit — ${VISIT}`,
  attractionLights: [
    { collector: "222a", lights: [2, 6] },
    { collector: "222b", lights: [5, 6] },
  ],
  triggered: [
    visit(
      {
        kind: "grant-keyword-all",
        filter: { type: "creature", controlledBy: "you", power: { op: "lte", n: 2 } },
        keyword: "horsemanship",
        duration: "end-of-turn",
      },
      VISIT,
    ),
  ],
});
