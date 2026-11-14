import { defineCard } from "../define.js";
import { visit } from "../helpers.js";

// An Attraction (rule 717): it starts in its owner's Attraction deck, and goes
// to their junkyard rather than a graveyard, hand or library (717.6).

const VISIT = "Creatures you control get +1/+0 until end of turn.";

export default defineCard({
  name: "Kiddie Coaster",
  types: ["artifact"],
  subtypes: ["Attraction"],
  text: `Visit — ${VISIT}`,
  attractionLights: [
    { collector: "219a", lights: [2, 3, 6] },
    { collector: "219b", lights: [2, 4, 6] },
    { collector: "219c", lights: [2, 5, 6] },
    { collector: "219d", lights: [3, 4, 6] },
    { collector: "219e", lights: [3, 5, 6] },
    { collector: "219f", lights: [4, 5, 6] },
  ],
  triggered: [
    visit(
      { kind: "modify-pt-all", filter: { type: "creature", controlledBy: "you" }, power: 1, toughness: 0, duration: "end-of-turn" },
      VISIT,
    ),
  ],
});
