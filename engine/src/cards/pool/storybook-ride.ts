import { defineCard } from "../define.js";
import { visit } from "../helpers.js";

// An Attraction (rule 717): it starts in its owner's Attraction deck, and goes
// to their junkyard rather than a graveyard, hand or library (717.6).
// X counts each Attraction visited this turn once, this one included (it's
// journaled as it's visited, before this resolves). Glimpse the Impossible's
// shape; Bow of Nylea's bottom "in any order".

const VISIT = "Exile the top X cards of your library, where X is the number of Attractions you've visited this turn (including this one). You may play those cards this turn. At the beginning of the next end step, if any of those cards remain exiled, put them on the bottom of your library in any order.";

export default defineCard({
  name: "Storybook Ride",
  types: ["artifact"],
  subtypes: ["Attraction"],
  text: `Visit — ${VISIT}`,
  attractionLights: [
    { collector: "229a", lights: [2, 5, 6] },
    { collector: "229b", lights: [3, 4, 6] },
  ],
  triggered: [
    visit(
      {
        kind: "sequence",
        effects: [
          { kind: "impulse-exile", amount: { turnHistory: "visited" }, duration: "end-of-turn", play: true },
          {
            kind: "delayed-trigger",
            at: { step: "end" },
            about: "exiled",
            effect: {
              kind: "for-each-target",
              from: 0,
              simultaneous: true,
              effect: { kind: "put-on-library", target: 0, position: "bottom" },
            },
            text: "At the beginning of the next end step, if any of those cards remain exiled, put them on the bottom of your library in any order.",
          },
        ],
      },
      VISIT,
    ),
  ],
});
