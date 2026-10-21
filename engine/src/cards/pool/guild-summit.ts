import { defineCard } from "../define.js";

// EDHREC rank 8165.
//
// Minas Tirith Garrison's shape: choose any number of untapped Gates you
// control as it resolves (none is the "may"), tap them, then draw one for
// each tapped this way.
const ENTERS_TEXT =
  "When this enchantment enters, you may tap any number of untapped Gates you control. Draw a card for each Gate tapped this way.";
const GATE_TEXT = "Whenever a Gate you control enters, draw a card.";

export default defineCard({
  name: "Guild Summit",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: `${ENTERS_TEXT}\n${GATE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "choose-permanents",
            filter: { subtype: "Gate", controlledBy: "you", tapped: false },
            min: 0,
            upTo: { countOf: { subtype: "Gate", controlledBy: "you", tapped: false } },
            then: { kind: "tap", target: 0 },
            prompt: "Tap any number of untapped Gates you control",
          },
          { kind: "draw", amount: { thisWay: "tapped" } },
        ],
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Gate" } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: GATE_TEXT,
    },
  ],
});
