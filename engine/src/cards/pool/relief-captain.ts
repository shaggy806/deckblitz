import { defineCard } from "../define.js";
import { distinctTargets } from "../helpers.js";

// EDHREC rank 22980.
const SUPPORT_TEXT =
  "When this creature enters, support 3. (Put a +1/+1 counter on each of up to three other target creatures.)";

export default defineCard({
  name: "Relief Captain",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kor", "Knight", "Ally"],
  power: 3,
  toughness: 2,
  text: SUPPORT_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: distinctTargets(3, { kind: "other", of: "creature" }, { optional: true }),
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          { kind: "add-counter", target: 1, counter: "+1/+1", amount: 1 },
          { kind: "add-counter", target: 2, counter: "+1/+1", amount: 1 },
        ],
      },
      resolve: null,
      text: SUPPORT_TEXT,
    },
  ],
});
