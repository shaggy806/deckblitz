import { defineCard } from "../define.js";

// K'un-Lun Warrior's shape: "you may", then which of the two, each "if you do"
// reading what was actually sacrificed or discarded. It may sacrifice itself
// (the ruling), and only ever does one (the ruling).
const TEXT = "When this creature enters, you may sacrifice a creature or discard a creature card. If you do, draw a card.";

export default defineCard({
  name: "Crypt Lurker",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Horror"],
  power: 3,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Sacrifice a creature or discard a creature card to draw a card?",
        effect: {
          kind: "modal",
          minModes: 1,
          maxModes: 1,
          modes: [
            {
              text: "Sacrifice a creature.",
              effect: {
                kind: "sequence",
                effects: [
                  { kind: "sacrifice", who: "you", filter: { type: "creature" }, count: 1 },
                  {
                    kind: "conditional",
                    condition: { kind: "this-way", what: "sacrificed", who: "you" },
                    then: { kind: "draw", amount: 1 },
                  },
                ],
              },
            },
            {
              text: "Discard a creature card.",
              effect: {
                kind: "sequence",
                effects: [
                  { kind: "discard", target: "you", amount: 1, filter: { type: "creature" } },
                  {
                    kind: "conditional",
                    condition: { kind: "this-way", what: "discarded" },
                    then: { kind: "draw", amount: 1 },
                  },
                ],
              },
            },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
