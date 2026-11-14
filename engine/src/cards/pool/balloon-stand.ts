import { defineCard } from "../define.js";
import { visit } from "../helpers.js";

// An Attraction (rule 717): it starts in its owner's Attraction deck, and goes
// to their junkyard rather than a graveyard, hand or library (717.6).
// The second mode's target is chosen as the visit ability goes on the stack
// (rule 700.2b); the Balloon is sacrificed as it resolves, and only then does
// the creature gain flying ("if you do").

const VISIT = "Choose one.\n• Create a 1/1 red Balloon creature token with flying.\n• Sacrifice a Balloon. If you do, target creature gains flying until end of turn.";

export default defineCard({
  name: "Balloon Stand",
  types: ["artifact"],
  subtypes: ["Attraction"],
  text: `Visit — ${VISIT}`,
  attractionLights: [
    { collector: "200a", lights: [2, 6] },
    { collector: "200b", lights: [3, 6] },
    { collector: "200c", lights: [4, 6] },
    { collector: "200d", lights: [5, 6] },
  ],
  triggered: [
    visit(
      {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "Create a 1/1 red Balloon creature token with flying.",
            effect: { kind: "create-token", token: "Balloon Token", count: 1 },
          },
          {
            text: "Sacrifice a Balloon. If you do, target creature gains flying until end of turn.",
            targets: ["creature"],
            effect: {
              kind: "sequence",
              effects: [
                { kind: "sacrifice", who: "you", filter: { subtype: "Balloon" }, count: 1 },
                {
                  kind: "conditional",
                  condition: { kind: "this-way", what: "sacrificed", atLeast: 1 },
                  then: { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
                },
              ],
            },
          },
        ],
      },
      VISIT,
    ),
  ],
});
