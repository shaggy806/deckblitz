import { defineCard } from "../define.js";

// EDHREC rank 18029.

const DOUBLE_TEXT =
  "If you gaining life causes a triggered ability of a permanent you control to trigger, that ability triggers an additional time.";
const COUNTER_TEXT = "Whenever you gain life, put a +1/+1 counter on Dr. Crusher.";

// Her own "whenever you gain life" is one such ability: it triggers twice.
export default defineCard({
  name: "Dr. Beverly Crusher",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Doctor"],
  power: 2,
  toughness: 2,
  text: `${DOUBLE_TEXT}\n${COUNTER_TEXT}`,
  static: [{ affects: { scope: "self" }, doubleTriggers: { cause: "you-gain-life" }, text: DOUBLE_TEXT }],
  triggered: [
    {
      trigger: { on: "gains-life", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: COUNTER_TEXT,
    },
  ],
});
