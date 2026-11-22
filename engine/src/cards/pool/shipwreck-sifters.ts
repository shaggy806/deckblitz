import { defineCard } from "../define.js";

// EDHREC rank 26694.

const ENTER_TEXT = "When this creature enters, draw a card, then discard a card.";
const DISCARD_TEXT =
  "Whenever you discard a Spirit card or a card with disturb, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Shipwreck Sifters",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 1,
  toughness: 2,
  text: `${ENTER_TEXT}\n${DISCARD_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "discard", target: "you", amount: 1 },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: {
        on: "discards",
        who: "you",
        perCard: true,
        filter: { anyOf: [{ subtype: "Spirit" }, { hasKeyword: "disturb" }] },
      },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: DISCARD_TEXT,
    },
  ],
});
