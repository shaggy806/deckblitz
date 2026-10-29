import { defineCard } from "../define.js";

const ENTERS = "When this creature enters, target opponent reveals their hand. You choose a nonland card from it and exile that card.";
const LEAVES = "When this creature leaves the battlefield, target opponent draws a card.";

export default defineCard({
  name: "Thought-Knot Seer",
  manaCost: "{3}{C}",
  types: ["creature"],
  subtypes: ["Eldrazi"],
  power: 4,
  toughness: 4,
  text: `${ENTERS}\n${LEAVES}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: { kind: "discard-chosen", target: 0, filter: { notTypes: ["land"] }, destination: "exile" },
      resolve: null,
      text: ENTERS,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: ["opponent"],
      effect: { kind: "draw", amount: 1, target: 0 },
      resolve: null,
      text: LEAVES,
    },
  ],
});
