import { defineCard } from "../define.js";
import { distinctTargets } from "../helpers.js";

// EDHREC rank 26936.
const SUPPORT_TEXT =
  "When this creature enters, support 2. (Put a +1/+1 counter on each of up to two other target creatures.)";

export default defineCard({
  name: "Saddleback Lagac",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Lizard"],
  power: 3,
  toughness: 1,
  text: SUPPORT_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: distinctTargets(2, { kind: "other", of: "creature" }, { optional: true }),
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          { kind: "add-counter", target: 1, counter: "+1/+1", amount: 1 },
        ],
      },
      resolve: null,
      text: SUPPORT_TEXT,
    },
  ],
});
