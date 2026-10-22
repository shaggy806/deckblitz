import { defineCard } from "../define.js";

// EDHREC rank 13711. Amonkhet. The brick counter rides on the first mana
// ability (Vulshok Factory's `also`); the second is gated on three of them.

const ONE_TEXT = "{2}, {T}: Add one mana of any color. Put a brick counter on this artifact.";
const THREE_TEXT =
  "{T}: Add three mana of any one color. Activate only if there are three or more brick counters on this artifact.";

export default defineCard({
  name: "Pyramid of the Pantheon",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: `${ONE_TEXT}\n${THREE_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "any-color",
        amount: 1,
        also: { kind: "add-counter", target: "source", counter: "brick", amount: 1 },
      },
      resolve: null,
      text: ONE_TEXT,
    },
    {
      cost: { mana: null, tap: true },
      condition: { kind: "self-counters", counter: "brick", compare: { op: "gte", n: 3 } },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 3 },
      resolve: null,
      text: THREE_TEXT,
    },
  ],
});
