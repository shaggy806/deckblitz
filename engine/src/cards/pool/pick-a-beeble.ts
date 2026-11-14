import { defineCard } from "../define.js";
import { visit } from "../helpers.js";

// An Attraction (rule 717): it starts in its owner's Attraction deck, and goes
// to their junkyard rather than a graveyard, hand or library (717.6).
// The die is an ordinary roll (rule 706), not a roll to visit. The prize is
// part of the visit ability (rule 702.159b).

const VISIT = "Roll a six-sided die. Put a number of luck counters on Pick-a-Beeble equal to the result and create a Treasure token. Then if there are six or more luck counters on Pick-a-Beeble, claim the prize!\nPrize — Create two Treasure tokens, then sacrifice Pick-a-Beeble and open an Attraction.";

export default defineCard({
  name: "Pick-a-Beeble",
  types: ["artifact"],
  subtypes: ["Attraction"],
  text: `Visit — ${VISIT}`,
  attractionLights: [
    { collector: "223a", lights: [2, 3, 6] },
    { collector: "223b", lights: [2, 4, 6] },
    { collector: "223c", lights: [2, 5, 6] },
    { collector: "223d", lights: [3, 4, 6] },
    { collector: "223e", lights: [3, 5, 6] },
    { collector: "223f", lights: [4, 5, 6] },
  ],
  triggered: [
    visit(
      {
        kind: "roll-dice",
        sides: 6,
        then: {
          kind: "sequence",
          effects: [
            { kind: "add-counter", target: "source", counter: "luck", amount: { roll: "total" } },
            { kind: "create-token", token: "Treasure Token", count: 1 },
            {
              kind: "conditional",
              condition: { kind: "self-counters", counter: "luck", compare: { op: "gte", n: 6 } },
              then: {
                kind: "claim-the-prize",
                prize: {
                  kind: "sequence",
                  effects: [
                    { kind: "create-token", token: "Treasure Token", count: 2 },
                    { kind: "sacrifice-source" },
                    { kind: "open-attraction" },
                  ],
                },
              },
            },
          ],
        },
      },
      VISIT,
    ),
  ],
});
