import { defineCard } from "../define.js";
import { visit } from "../helpers.js";

// An Attraction (rule 717): it starts in its owner's Attraction deck, and goes
// to their junkyard rather than a graveyard, hand or library (717.6).
// Not targeted: chosen as it resolves among the tied lowest (Drop of Honey's
// shape). "Creatures you don't control" are the opponents' (rule 102.3).

const VISIT = "Return a creature you don't control with the lowest toughness among creatures you don't control to its owner's hand. (If multiple creatures are tied, choose any one of them.)";

export default defineCard({
  name: "Bounce Chamber",
  types: ["artifact"],
  subtypes: ["Attraction"],
  text: `Visit — ${VISIT}`,
  attractionLights: [
    { collector: "201a", lights: [2, 6] },
    { collector: "201b", lights: [3, 6] },
    { collector: "201c", lights: [4, 6] },
    { collector: "201d", lights: [5, 6] },
  ],
  triggered: [
    visit(
      {
        kind: "choose-permanents",
        filter: {
          type: "creature",
          controlledBy: "opponent",
          greatestInZone: { of: "toughness", among: { type: "creature", controlledBy: "opponent" }, least: true },
        },
        min: 1,
        upTo: 1,
        then: { kind: "return-to-hand", target: 0 },
        prompt: "Return the creature you don't control with the lowest toughness",
      },
      VISIT,
    ),
  ],
});
