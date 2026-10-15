import { defineCard } from "../define.js";

// EDHREC rank 23918. Vision of Love's shape, as an enters trigger drawing one:
// "you may", then which of the two, each "if you do" reading what was
// actually sacrificed or discarded.
const ETB_TEXT = "When this creature enters, you may sacrifice an artifact or discard a card. If you do, draw a card.";

export default defineCard({
  name: "K'un-Lun Warrior",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Warrior", "Hero"],
  power: 2,
  toughness: 2,
  text: ETB_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Sacrifice an artifact or discard a card to draw a card?",
        effect: {
          kind: "modal",
          minModes: 1,
          maxModes: 1,
          modes: [
            {
              text: "Sacrifice an artifact.",
              effect: {
                kind: "sequence",
                effects: [
                  { kind: "sacrifice", who: "you", filter: { type: "artifact" }, count: 1 },
                  {
                    kind: "conditional",
                    condition: { kind: "this-way", what: "sacrificed", who: "you" },
                    then: { kind: "draw", amount: 1 },
                  },
                ],
              },
            },
            {
              text: "Discard a card.",
              effect: {
                kind: "sequence",
                effects: [
                  { kind: "discard", target: "you", amount: 1 },
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
      text: ETB_TEXT,
    },
  ],
});
