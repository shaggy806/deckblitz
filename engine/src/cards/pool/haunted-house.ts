import { defineCard } from "../define.js";
import { visit } from "../helpers.js";

// An Attraction (rule 717): it starts in its owner's Attraction deck, and goes
// to their junkyard rather than a graveyard, hand or library (717.6).
// Lukka, Wayward Bonder's shape, at your next end step.

const VISIT = "Return target creature card from your graveyard to the battlefield. It gains haste. Exile it at the beginning of your next end step.";

export default defineCard({
  name: "Haunted House",
  types: ["artifact"],
  subtypes: ["Attraction"],
  text: `Visit — ${VISIT}`,
  attractionLights: [
    { collector: "217a", lights: [3, 6] },
    { collector: "217b", lights: [4, 6] },
  ],
  triggered: [
    visit(
      {
        kind: "sequence",
        effects: [
          { kind: "put-onto-battlefield", target: 0 },
          { kind: "grant-keyword", target: 0, keyword: "haste", duration: "permanent" },
          {
            kind: "delayed-trigger",
            at: { step: "end", whose: "you" },
            effect: { kind: "exile", target: 0 },
            text: "Exile it at the beginning of your next end step.",
          },
        ],
      },
      VISIT,
      [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
    ),
  ],
});
