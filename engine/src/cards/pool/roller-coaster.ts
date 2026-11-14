import { defineCard } from "../define.js";
import { visit } from "../helpers.js";

// An Attraction (rule 717): it starts in its owner's Attraction deck, and goes
// to their junkyard rather than a graveyard, hand or library (717.6).

const VISIT = "Creatures you control get +2/+0 until end of turn.";

export default defineCard({
  name: "Roller Coaster",
  types: ["artifact"],
  subtypes: ["Attraction"],
  text: `Visit — ${VISIT}`,
  attractionLights: [
    { collector: "225a", lights: [2, 6] },
    { collector: "225b", lights: [3, 6] },
    { collector: "225c", lights: [4, 6] },
    { collector: "225d", lights: [5, 6] },
  ],
  triggered: [
    visit(
      { kind: "modify-pt-all", filter: { type: "creature", controlledBy: "you" }, power: 2, toughness: 0, duration: "end-of-turn" },
      VISIT,
    ),
  ],
});
