import { defineCard } from "../define.js";

const OPEN = "When this creature enters, open an Attraction. (Put the top card of your Attraction deck onto the battlefield.)";
const END =
  "At the beginning of your end step, if you control three or more Attractions, you draw a card and you lose 1 life.";

export default defineCard({
  name: "Discourtesy Clerk",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Employee"],
  power: 3,
  toughness: 2,
  text: `${OPEN}\n${END}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "open-attraction" },
      resolve: null,
      text: OPEN,
    },
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "controls", filter: { subtype: "Attraction" }, atLeast: 3 },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "lose-life", amount: 1 },
        ],
      },
      resolve: null,
      text: END,
    },
  ],
});
