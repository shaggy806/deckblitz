import { defineCard } from "../define.js";

// EDHREC rank 18674.

const ENTER_TEXT = "When this creature enters, put a +1/+1 counter on target creature you control without flying.";

export default defineCard({
  name: "Pileated Provisioner",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird", "Scout"],
  power: 3,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", whose: "you", filter: { type: "creature", notKeyword: "flying" } }],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
